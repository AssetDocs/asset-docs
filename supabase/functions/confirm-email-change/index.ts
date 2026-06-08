// confirm-email-change — Stage 2 of email change flow.
//
// Public endpoint (no JWT required) that consumes a one-time token issued by
// request-email-change. Validates expiry/uniqueness server-side, then changes
// the auth user's email via the admin API. Marks the row confirmed.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';
import { sha256Hex } from '../_shared/mfa.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  let body: { token?: string };
  try { body = await req.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }
  const token = body.token?.trim();
  if (!token || token.length < 32) return json({ error: 'Invalid token' }, 400);

  const svc = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  const tokenHash = await sha256Hex(token);

  const { data: row, error: findErr } = await svc
    .from('email_change_requests')
    .select('id, user_id, new_email, expires_at, confirmed_at, cancelled_at')
    .eq('token_hash', tokenHash)
    .maybeSingle();

  if (findErr || !row) return json({ error: 'Invalid or expired token' }, 400);
  if (row.confirmed_at) return json({ error: 'This link has already been used' }, 410);
  if (row.cancelled_at) return json({ error: 'This request was cancelled' }, 410);
  if (new Date(row.expires_at).getTime() < Date.now()) {
    return json({ error: 'This link has expired' }, 410);
  }

  // Update the auth user's email (admin API).
  const { error: updErr } = await svc.auth.admin.updateUserById(row.user_id, {
    email: row.new_email,
    email_confirm: true,
  });
  if (updErr) {
    console.error('[confirm-email-change] updateUserById failed:', updErr);
    // Likely cause: new email already in use by another account.
    return json({ error: updErr.message || 'Could not change email' }, 409);
  }

  // Mark consumed
  await svc
    .from('email_change_requests')
    .update({ confirmed_at: new Date().toISOString() })
    .eq('id', row.id);

  // Best-effort: keep profiles.email in sync if that column exists
  try {
    await svc.from('profiles').update({ email: row.new_email }).eq('user_id', row.user_id);
  } catch (_e) { /* ignore — column may not exist */ }

  return json({ success: true, message: 'Your email has been updated. Please sign in with your new email.' });
});
