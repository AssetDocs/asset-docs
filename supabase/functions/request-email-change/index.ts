// request-email-change — Stage 1 of email change flow.
//
// Security model:
//   1. Caller must be authenticated.
//   2. Caller must have a FRESH MFA step-up (last 60s) if MFA is enrolled.
//   3. New email is validated and rate-limited (one open request per user).
//   4. A high-entropy token is generated; only its SHA-256 hash is stored.
//   5. A confirmation link is sent to the NEW email address.
//   6. A security-alert email is sent to the OLD email address (best-effort).
//   7. The auth user's email is NOT changed here — that happens in
//      confirm-email-change after the token is presented.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';
import { Resend } from 'npm:resend@3.2.0';
import {
  getCallerUser,
  getClientIp,
  hasFreshStepUp,
  logMfaAttempt,
  sha256Hex,
  userHasMfa,
} from '../_shared/mfa.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONFIRM_BASE_URL = 'https://www.getassetsafe.com/confirm-email-change';

function randomToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
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
  const ua = req.headers.get('user-agent') ?? null;

  const svc = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  const { user } = await getCallerUser(authHeader);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  // Step-up gate (fresh) — only enforced if MFA enrolled
  if (await userHasMfa(svc, user.id)) {
    if (!(await hasFreshStepUp(svc, user.id))) {
      await logMfaAttempt(svc, { userId: user.id, ip, kind: 'request_email_change', outcome: 'denied', metadata: { reason: 'no_fresh_step_up' } });
      return json({ error: 'Fresh MFA step-up required', code: 'step_up_required' }, 403);
    }
  }

  let body: { newEmail?: string };
  try { body = await req.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }

  const newEmail = (body.newEmail ?? '').trim().toLowerCase();
  if (!newEmail || !EMAIL_RE.test(newEmail) || newEmail.length > 254) {
    return json({ error: 'Invalid email address' }, 400);
  }
  if (newEmail === user.email?.toLowerCase()) {
    return json({ error: 'New email matches your current email' }, 400);
  }

  // Cancel any prior open request for this user
  await svc
    .from('email_change_requests')
    .update({ cancelled_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .is('confirmed_at', null)
    .is('cancelled_at', null);

  const token = randomToken();
  const tokenHash = await sha256Hex(token);

  const { error: insErr } = await svc.from('email_change_requests').insert({
    user_id: user.id,
    new_email: newEmail,
    token_hash: tokenHash,
    ip,
    user_agent: ua,
  });
  if (insErr) {
    console.error('[request-email-change] insert failed:', insErr);
    return json({ error: 'Could not start email change' }, 500);
  }

  // Send emails (best-effort)
  const resendKey = Deno.env.get('RESEND_API_KEY');
  if (resendKey) {
    const resend = new Resend(resendKey);
    const confirmUrl = `${CONFIRM_BASE_URL}?token=${token}`;
    const safeNew = escapeHtml(newEmail);

    // Confirmation to the NEW address
    try {
      await resend.emails.send({
        from: 'Asset Safe <noreply@assetsafe.net>',
        to: [newEmail],
        subject: 'Confirm your new Asset Safe email address',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background:#f8fafc;">
            <div style="background:#ffffff; padding: 28px; border-radius: 8px;">
              <h2 style="color:#1f2937; margin:0 0 16px;">Confirm your new email</h2>
              <p style="color:#374151; line-height:1.6;">
                Someone (hopefully you) requested to change the email address on your Asset Safe
                account to <strong>${safeNew}</strong>. This link expires in 15 minutes.
              </p>
              <div style="text-align:center; margin: 24px 0;">
                <a href="${confirmUrl}" style="background:#1e40af; color:#ffffff; padding:14px 28px; text-decoration:none; border-radius:6px; font-weight:600; display:inline-block;">
                  Confirm new email
                </a>
              </div>
              <p style="color:#6b7280; font-size:13px;">
                If you didn't request this, you can safely ignore this email — your account email will not be changed.
              </p>
              <p style="color:#6b7280; font-size:12px; word-break:break-all;">
                Direct link: <a href="${confirmUrl}">${escapeHtml(confirmUrl)}</a>
              </p>
            </div>
          </div>
        `,
        text:
          `Confirm your new Asset Safe email\n\n` +
          `We received a request to change the email on your Asset Safe account to ${newEmail}.\n` +
          `Confirm within 15 minutes: ${confirmUrl}\n\n` +
          `If you didn't request this, ignore this email.`,
      });
    } catch (e) {
      console.error('[request-email-change] confirm email failed:', e);
    }

    // Security alert to the CURRENT address
    if (user.email) {
      try {
        await resend.emails.send({
          from: 'Asset Safe <noreply@assetsafe.net>',
          to: [user.email],
          subject: 'Security alert: email change requested',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background:#f8fafc;">
              <div style="background:#ffffff; padding: 28px; border-radius: 8px;">
                <h2 style="color:#1f2937; margin:0 0 16px;">Email change requested</h2>
                <p style="color:#374151; line-height:1.6;">
                  We received a request to change the email on your Asset Safe account to
                  <strong>${safeNew}</strong>. We've sent a confirmation link to that address.
                </p>
                <p style="color:#374151; line-height:1.6;">
                  <strong>If this wasn't you</strong>, your account is still safe — the change will not take
                  effect unless the new address is confirmed. We recommend signing in, changing your password,
                  and reviewing your authorized devices immediately.
                </p>
                <p style="color:#6b7280; font-size:12px;">IP: ${escapeHtml(ip ?? 'unknown')}</p>
              </div>
            </div>
          `,
          text:
            `Email change requested on your Asset Safe account\n\n` +
            `A request was made to change your email to ${newEmail}.\n` +
            `If this wasn't you, sign in and change your password immediately.`,
        });
      } catch (e) {
        console.error('[request-email-change] alert email failed:', e);
      }
    }
  } else {
    console.warn('[request-email-change] RESEND_API_KEY not set — emails skipped');
  }

  return json({ success: true, message: 'Confirmation email sent to your new address.' });
});
