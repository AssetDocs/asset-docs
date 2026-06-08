// mfa-unenroll: Cleanly disable MFA — unenroll the TOTP factor, wipe backup
// codes, and clear active step-up sessions. Requires a FRESH step-up
// (within the last 60s) before allowing the unenroll.

import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import {
  getCallerUser,
  getClientIp,
  hasFreshStepUp,
  logMfaAttempt,
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
  const svc = serviceClient();

  const { user } = await getCallerUser(authHeader);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const fresh = await hasFreshStepUp(svc, user.id);
  if (!fresh) {
    await logMfaAttempt(svc, { userId: user.id, ip, kind: 'mfa_unenroll', outcome: 'denied', metadata: { reason: 'no_fresh_step_up' } });
    return json({ error: 'Fresh MFA step-up required', code: 'step_up_required' }, 403);
  }

  let body: { factorId?: string };
  try { body = await req.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }
  if (!body.factorId) return json({ error: 'factorId required' }, 400);

  // Confirm factor belongs to caller
  const { data: factorsData } = await svc.auth.admin.mfa.listFactors({ userId: user.id });
  const owned = (factorsData?.factors ?? []).some((f: any) => f.id === body.factorId);
  if (!owned) return json({ error: 'Invalid factor' }, 403);

  // Unenroll via user-scoped client (so Supabase clears the session's AAL2 state too)
  const userClient = userScopedClient(authHeader!);
  const { error: unenrollErr } = await userClient.auth.mfa.unenroll({ factorId: body.factorId });
  if (unenrollErr) {
    return json({ error: unenrollErr.message }, 500);
  }

  // Wipe backup codes and active step-up sessions
  await svc.from('backup_codes').delete().eq('user_id', user.id);
  await svc.from('mfa_step_up_sessions').delete().eq('user_id', user.id);

  await logMfaAttempt(svc, { userId: user.id, ip, kind: 'mfa_unenroll', outcome: 'success' });
  return json({ success: true });
});
