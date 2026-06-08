// manage-backup-codes — v4.2
//
// Changes vs. previous version:
//  - Backup codes are now hashed with HMAC-SHA256 using BACKUP_CODE_PEPPER
//    (stored algo: 'hmac-sha256-pepper'). Existing 'sha256' rows remain
//    verifiable as a legacy fallback until rotated.
//  - 'generate' requires a FRESH step-up (within 60s) AND a verified TOTP
//    factor on file. This blocks an attacker with only a stolen session
//    from minting recovery codes.
//  - 'verify' is left in place for legacy callers but does NOT itself create
//    a step-up session — use the dedicated mfa-step-up function for that.

import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import {
  getCallerUser,
  getClientIp,
  hasFreshStepUp,
  hmacBackupCode,
  logMfaAttempt,
  normalizeBackupCode,
  serviceClient,
  sha256Hex,
} from '../_shared/mfa.ts';

function generateBackupCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  let code = '';
  for (let i = 0; i < 8; i++) code += chars[bytes[i] % chars.length];
  return `${code.slice(0, 4)}-${code.slice(4)}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  const authHeader = req.headers.get('Authorization');
  const ip = getClientIp(req);
  const svc = serviceClient();

  const { user } = await getCallerUser(authHeader);
  if (!user) return json({ error: 'Unauthorized' }, 401);
  const userId = user.id;

  let payload: { action?: string; code?: string };
  try { payload = await req.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }
  const { action, code } = payload;

  // -------- generate --------
  if (action === 'generate') {
    // Require enrolled TOTP factor
    const { data: factorsData } = await svc.auth.admin.mfa.listFactors({ userId });
    const hasVerifiedTotp = (factorsData?.factors ?? []).some(
      (f: any) => f.factor_type === 'totp' && f.status === 'verified',
    );
    if (!hasVerifiedTotp) {
      return json({ error: 'Enable MFA before generating backup codes' }, 403);
    }

    // Require FRESH step-up
    const fresh = await hasFreshStepUp(svc, userId);
    if (!fresh) {
      await logMfaAttempt(svc, { userId, ip, kind: 'backup_codes_generate', outcome: 'denied', metadata: { reason: 'no_fresh_step_up' } });
      return json({ error: 'Fresh MFA step-up required', code: 'step_up_required' }, 403);
    }

    // Replace existing codes
    await svc.from('backup_codes').delete().eq('user_id', userId);

    const plainCodes: string[] = [];
    const rows: Array<{ user_id: string; code_hash: string; code_hash_algo: string }> = [];
    for (let i = 0; i < 10; i++) {
      const plain = generateBackupCode();
      const hash = await hmacBackupCode(plain);
      plainCodes.push(plain);
      rows.push({ user_id: userId, code_hash: hash, code_hash_algo: 'hmac-sha256-pepper' });
    }

    const { error: insErr } = await svc.from('backup_codes').insert(rows);
    if (insErr) {
      return json({ error: 'Failed to generate backup codes' }, 500);
    }

    await logMfaAttempt(svc, { userId, ip, kind: 'backup_codes_generate', outcome: 'success' });
    return json({
      success: true,
      codes: plainCodes,
      message: 'Save these codes securely. They will not be shown again.',
    });
  }

  // -------- verify (legacy redemption; does NOT mint step-up by itself) --------
  if (action === 'verify') {
    if (!code) return json({ error: 'Code is required' }, 400);
    const normalized = normalizeBackupCode(code);
    const hmac = await hmacBackupCode(normalized);
    const legacy = await sha256Hex(normalized);

    const { data: match } = await svc
      .from('backup_codes')
      .select('id')
      .eq('user_id', userId)
      .in('code_hash', [hmac, legacy])
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (!match) {
      await logMfaAttempt(svc, { userId, ip, kind: 'backup_code_verify', outcome: 'failure' });
      return json({ success: false, error: 'Invalid or already used backup code' });
    }

    const { error: updErr } = await svc
      .from('backup_codes')
      .update({ used_at: new Date().toISOString() })
      .eq('id', match.id);
    if (updErr) return json({ error: 'Failed to verify code' }, 500);

    await logMfaAttempt(svc, { userId, ip, kind: 'backup_code_verify', outcome: 'success' });
    return json({ success: true, message: 'Backup code verified' });
  }

  // -------- status --------
  if (action === 'status') {
    const { count } = await svc
      .from('backup_codes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString());
    return json({
      success: true,
      remainingCodes: count ?? 0,
      hasBackupCodes: (count ?? 0) > 0,
    });
  }

  return json({ error: 'Invalid action' }, 400);
});
