import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (s: string, d?: any) => console.log(`[SEND-CANCEL-EMAILS] ${s}${d ? ' ' + JSON.stringify(d) : ''}`);

interface Body {
  account_id: string | null;
  owner_user_id: string;
  owner_email: string;
  owner_name?: string;
  period_end?: string | null;
}

const brand = (inner: string) => `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc">
  <div style="text-align:center;padding:30px 20px 20px">
    <img src="https://getassetsafe.com/lovable-uploads/asset-safe-logo-email-v2.jpg" alt="Asset Safe" style="max-width:200px"/>
  </div>
  <div style="background:#ffffff;padding:30px 25px;margin:0 20px;border-radius:8px">${inner}</div>
  <div style="padding:20px;text-align:center"><p style="color:#9ca3af;font-size:12px;margin:0">This is an automated notification from Asset Safe.</p></div>
</div>`;

const ownerHtml = (name: string, periodEnd: string | null) => brand(`
  <h2 style="color:#1f2937;margin:0 0 20px;font-size:22px">Your Asset Safe subscription cancellation is confirmed</h2>
  <p style="color:#374151;line-height:1.6">Hi ${name},</p>
  <p style="color:#374151;line-height:1.6">Your subscription cancellation has been received. Here's what happens next:</p>
  <ul style="color:#374151;line-height:1.8;padding-left:20px">
    <li>You'll keep full access until ${periodEnd ? `<strong>${new Date(periodEnd).toLocaleDateString()}</strong>` : 'the end of your billing period'}.</li>
    <li><strong>Your records remain securely stored.</strong> Nothing is deleted.</li>
    <li>After your billing period ends, your account moves to read-only mode so you can still view and export your information.</li>
    <li>You can reactivate at any time, or request permanent account deletion separately.</li>
  </ul>
  <p style="margin:24px 0"><a href="https://getassetsafe.com/account" style="background:#ea580c;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:600">View Account</a></p>
  <p style="color:#6b7280;font-size:13px">Questions? Reply to this email or contact support@assetsafe.net.</p>
`);

const auHtml = (name: string) => brand(`
  <h2 style="color:#1f2937;margin:0 0 20px;font-size:22px">Asset Safe access update</h2>
  <p style="color:#374151;line-height:1.6">Hi ${name},</p>
  <p style="color:#374151;line-height:1.6">
    The Asset Safe account you've been given access to is scheduled to end at its next billing cycle.
    You'll continue to have access until then.
  </p>
  <p style="color:#374151;line-height:1.6">
    Now's a good time to download or export anything you may need from the shared account.
  </p>
  <p style="margin:24px 0"><a href="https://getassetsafe.com/dashboard" style="background:#ea580c;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:600">Open Asset Safe</a></p>
  <p style="color:#6b7280;font-size:13px">If you have questions, please contact the account owner directly.</p>
`);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY is not set");
    const resend = new Resend(resendKey);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const body: Body = await req.json();
    if (!body.owner_user_id || !body.owner_email) throw new Error("Missing owner_user_id or owner_email");

    const accountId = body.account_id;
    const eventOwner = 'cancellation_owner';
    const eventAu = 'cancellation_authorized_user';

    const sendOnce = async (params: { event_type: string; email: string; user_id: string | null; html: string; subject: string }) => {
      // idempotency
      const { data: existing } = await supabase
        .from('subscription_email_events')
        .select('id')
        .eq('account_id', accountId)
        .eq('event_type', params.event_type)
        .eq('recipient_email', params.email)
        .maybeSingle();
      if (existing) {
        log("Skipping duplicate", { event: params.event_type, to: params.email });
        return { skipped: true };
      }
      try {
        const res = await resend.emails.send({
          from: "Asset Safe <noreply@assetsafe.net>",
          to: [params.email],
          subject: params.subject,
          html: params.html,
        });
        await supabase.from('subscription_email_events').insert({
          account_id: accountId,
          user_id: params.user_id,
          event_type: params.event_type,
          recipient_email: params.email,
          status: 'sent',
          resend_message_id: (res as any)?.data?.id ?? null,
        });
        return { sent: true };
      } catch (e: any) {
        await supabase.from('subscription_email_events').insert({
          account_id: accountId,
          user_id: params.user_id,
          event_type: params.event_type,
          recipient_email: params.email,
          status: 'failed',
        }).catch(() => {});
        return { error: e?.message || 'send failed' };
      }
    };

    // Owner email
    const ownerResult = await sendOnce({
      event_type: eventOwner,
      email: body.owner_email,
      user_id: body.owner_user_id,
      html: ownerHtml(body.owner_name || 'there', body.period_end ?? null),
      subject: "Your Asset Safe subscription cancellation is confirmed",
    });

    // AU emails
    let auSent = 0; let auSkipped = 0; let auFailed = 0;
    if (accountId) {
      const { data: memberships } = await supabase
        .from('account_memberships')
        .select('user_id, role')
        .eq('account_id', accountId)
        .eq('status', 'active')
        .neq('role', 'owner');

      for (const m of memberships || []) {
        const { data: au } = await supabase.auth.admin.getUserById(m.user_id);
        const email = au?.user?.email;
        if (!email) continue;
        const { data: prof } = await supabase
          .from('profiles')
          .select('first_name')
          .eq('user_id', m.user_id)
          .maybeSingle();
        const name = (prof?.first_name as string) || 'there';
        const r = await sendOnce({
          event_type: eventAu,
          email,
          user_id: m.user_id,
          html: auHtml(name),
          subject: "Asset Safe access update",
        });
        if ((r as any).sent) auSent++;
        else if ((r as any).skipped) auSkipped++;
        else auFailed++;
      }
    }

    // Mark profile
    await supabase
      .from('profiles')
      .update({ cancellation_notice_sent_at: new Date().toISOString() })
      .eq('user_id', body.owner_user_id);

    return new Response(JSON.stringify({
      success: true,
      owner: ownerResult,
      authorized_users: { sent: auSent, skipped: auSkipped, failed: auFailed },
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    log("ERROR", { message: e?.message });
    return new Response(JSON.stringify({ error: e?.message || 'unknown error' }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
