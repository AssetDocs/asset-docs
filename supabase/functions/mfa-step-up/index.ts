// mfa-step-up: User-scoped MFA challenge+verify for sensitive actions.
//
// Accepts either:
//   { factorId, code }                — TOTP verification via user-scoped
//                                       supabase.auth.mfa.challengeAndVerify
//   { backupCode }                    — app-side backup-code redemption
//                                       (requires user already has a verified
//                                        TOTP factor on file)
//
// On success, writes a row to public.mfa_step_up_sessions tied to the caller's
// user_id. The app's step-up enforcement reads that row — the browser session
// becoming AAL2 is a bonus, not the boundary. If Supabase returns a refreshed
// session from challengeAndVerify we forward it so the client can update its
// local session (best-effort).

import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import {
  getCallerUser,
  getClientIp,
  hmacBackupCode,
  sha256Hex,
  logMfaAttempt,
  normalizeBackupCode,
  recordStepUp,
  serviceClient,
  userScopedClient,
} from '../_shared/mfa.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  const authHeader = req.headers.get('Authorization');
  const ip = getClientIp(req);
  const ua = req.headers.get('user-agent') ?? undefined;
  const svc = serviceClient();

  const { user, token } = await getCallerUser(authHeader);
  if (!user || !token) {
    await logMfaAttempt(svc, { ip, kind: 'step_up', outcome: 'denied', metadata: { reason: 'no_jwt' } });
    return json({ error: 'Unauthorized' }, 401);
  }

  let body: { factorId?: string; code?: string; backupCode?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  // ---------- Path A: TOTP ----------
  if (body.factorId && body.code) {
    const factorId = body.factorId;
    const code = body.code.replace(/\s/g, '');

    // Confirm factor belongs to caller and is verified (admin listFactors)
    const { data: factorsData, error: factorsErr } =
      await svc.auth.admin.mfa.listFactors({ userId: user.id });
    if (factorsErr) {
      await logMfaAttempt(svc, { userId: user.id, ip, kind: 'step_up_totp', outcome: 'failure', metadata: { stage: 'listFactors', error: factorsErr.message } });
      return json({ error: 'Failed to verify factor' }, 500);
    }
    const factor = factorsData?.factors?.find((f: any) => f.id === factorId);
    if (!factor || factor.status !== 'verified' || factor.factor_type !== 'totp') {
      await logMfaAttempt(svc, { userId: user.id, ip, kind: 'step_up_totp', outcome: 'denied', metadata: { reason: 'factor_not_owned_or_unverified' } });
      return json({ error: 'Invalid factor' }, 403);
    }

    // User-scoped challengeAndVerify
    const userClient = userScopedClient(authHeader!);
    const { data: verifyData, error: verifyErr } =
      await userClient.auth.mfa.challengeAndVerify({ factorId, code });

    if (verifyErr || !verifyData) {
      await logMfaAttempt(svc, { userId: user.id, ip, kind: 'step_up_totp', outcome: 'failure', metadata: { error: verifyErr?.message } });
      return json({ error: 'Invalid code' }, 400);
    }

    const steppedUpUntil = await recordStepUp(svc, user.id, 'totp', ip ?? undefined, ua);
    await logMfaAttempt(svc, { userId: user.id, ip, kind: 'step_up_totp', outcome: 'success' });

    // Forward refreshed session if Supabase returned one (shape varies by version).
    const refreshedSession = (verifyData as any)?.session ?? null;

    return json({
      success: true,
      method: 'totp',
      stepped_up_until: steppedUpUntil,
      session: refreshedSession, // client may update its local session if present
    });
  }

  // ---------- Path B: Backup code ----------
  if (body.backupCode) {
    // Require a verified TOTP factor on file before allowing backup-code step-up.
    const { data: factorsData, error: factorsErr } =
      await svc.auth.admin.mfa.listFactors({ userId: user.id });
    if (factorsErr) {
      return json({ error: 'Failed to verify factor' }, 500);
    }
    const hasVerifiedTotp = (factorsData?.factors ?? []).some(
      (f: any) => f.factor_type === 'totp' && f.status === 'verified',
    );
    if (!hasVerifiedTotp) {
      await logMfaAttempt(svc, { userId: user.id, ip, kind: 'step_up_backup', outcome: 'denied', metadata: { reason: 'no_verified_totp' } });
      return json({ error: 'Backup codes require an enrolled authenticator' }, 403);
    }

    const normalized = normalizeBackupCode(body.backupCode);
    const hmac = await hmacBackupCode(normalized);
    const legacy = await sha256Hex(normalized);

    const { data: match, error: findErr } = await svc
      .from('backup_codes')
      .select('id, code_hash_algo')
      .eq('user_id', user.id)
      .in('code_hash', [hmac, legacy])
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (findErr || !match) {
      await logMfaAttempt(svc, { userId: user.id, ip, kind: 'step_up_backup', outcome: 'failure' });
      return json({ error: 'Invalid or already used backup code' }, 400);
    }

    const { error: updErr } = await svc
      .from('backup_codes')
      .update({ used_at: new Date().toISOString() })
      .eq('id', match.id);
    if (updErr) {
      return json({ error: 'Failed to redeem code' }, 500);
    }

    const steppedUpUntil = await recordStepUp(svc, user.id, 'backup_code', ip ?? undefined, ua);
    await logMfaAttempt(svc, { userId: user.id, ip, kind: 'step_up_backup', outcome: 'success' });

    return json({
      success: true,
      method: 'backup_code',
      stepped_up_until: steppedUpUntil,
    });
  }

  return json({ error: 'Provide { factorId, code } or { backupCode }' }, 400);
});
