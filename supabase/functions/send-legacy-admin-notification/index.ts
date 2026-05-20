import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPPORT_EMAIL = 'support@assetsafe.net';
const FROM = 'Asset Safe <noreply@assetsafe.net>';

function escapeHtml(s: string): string {
  return (s || '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!),
  );
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { legacy_admin_user_id, account_id } = await req.json();
    if (
      !legacy_admin_user_id ||
      typeof legacy_admin_user_id !== 'string' ||
      !account_id ||
      typeof account_id !== 'string'
    ) {
      return new Response(JSON.stringify({ error: 'legacy_admin_user_id and account_id required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Validate caller is the account owner
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    if (!userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);

    const { data: ownerCheck, error: ownerErr } = await admin.rpc('is_account_owner', {
      _user_id: userData.user.id,
      _account_id: account_id,
    });
    if (ownerErr || !ownerCheck) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Look up designated user's email
    const { data: designated } = await admin.auth.admin.getUserById(legacy_admin_user_id);
    const toEmail = designated?.user?.email;
    if (!toEmail) {
      return new Response(JSON.stringify({ error: 'Designated user has no email' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Owner display name
    const { data: ownerProfile } = await admin
      .from('profiles')
      .select('first_name, last_name')
      .eq('user_id', userData.user.id)
      .maybeSingle();
    const ownerName =
      `${ownerProfile?.first_name || ''} ${ownerProfile?.last_name || ''}`.trim() ||
      userData.user.email ||
      'The account owner';

    // Designated user display name
    const { data: designatedProfile } = await admin
      .from('profiles')
      .select('first_name')
      .eq('user_id', legacy_admin_user_id)
      .maybeSingle();
    const greetingName = designatedProfile?.first_name?.trim() || 'there';

    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (!resendKey) {
      console.error('RESEND_API_KEY missing');
      return new Response(JSON.stringify({ error: 'Email service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const subject = "You've been designated as a Continuity Steward on Asset Safe";

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937; line-height: 1.55;">
        <h2 style="color: #111827; margin: 0 0 16px;">You're now a Continuity Steward</h2>

        <p>Hi ${escapeHtml(greetingName)},</p>

        <p><strong>${escapeHtml(ownerName)}</strong> has designated you as a <strong>Continuity Steward</strong> for their Asset Safe account.</p>

        <p>This is a <em>designation</em> — not a change to your day-to-day role. Asset Safe focuses on emergency access, stewardship, and preservation. We do not handle ownership transfer, inheritance, succession, or estate adjudication.</p>

        <h3 style="color: #111827; margin: 24px 0 8px;">What stays the same</h3>
        <ul style="padding-left: 20px; margin: 0 0 16px;">
          <li>Your existing access level (Read Only or Full Access) is <strong>unchanged</strong>.</li>
          <li>You do <strong>not</strong> gain billing, account deletion, or owner-profile access today.</li>
          <li>You still cannot see anything you couldn't see before.</li>
          <li>${escapeHtml(ownerName)} remains in full control of their account.</li>
        </ul>

        <h3 style="color: #111827; margin: 24px 0 8px;">What's new</h3>
        <ul style="padding-left: 20px; margin: 0 0 16px;">
          <li>You are on record as ${escapeHtml(ownerName)}'s trusted steward for future continuity.</li>
          <li>If they ever become unable to manage their account, you can submit a <strong>continuity request</strong> for review — for temporary stewardship, a controlled export, preservation, memorialization, or a reviewed account closure.</li>
          <li>Every continuity request is manually reviewed by the Asset Safe team. Nothing happens automatically.</li>
        </ul>

        <p style="background: #f1f5f9; border-left: 3px solid #64748b; padding: 12px 14px; border-radius: 6px; margin: 24px 0;">
          You don't need to do anything right now. This designation is simply on file. ${escapeHtml(ownerName)} can change or remove it at any time.
        </p>

        <p>Questions? Reply to this email or reach us at <a href="mailto:${SUPPORT_EMAIL}" style="color: #2563eb;">${SUPPORT_EMAIL}</a>.</p>

        <p style="margin-top: 24px;">— The Asset Safe Team</p>
      </div>
    `;

    const text = [
      `Hi ${greetingName},`,
      ``,
      `${ownerName} has designated you as a Continuity Steward for their Asset Safe account.`,
      ``,
      `This is a designation — not a change to your day-to-day role. Asset Safe focuses on emergency access, stewardship, and preservation. We do not handle ownership transfer, inheritance, succession, or estate adjudication.`,
      ``,
      `WHAT STAYS THE SAME:`,
      `- Your existing access level (Read Only or Full Access) is unchanged.`,
      `- You do NOT gain billing, account deletion, or owner-profile access today.`,
      `- You still cannot see anything you couldn't see before.`,
      `- ${ownerName} remains in full control of their account.`,
      ``,
      `WHAT'S NEW:`,
      `- You are on record as ${ownerName}'s trusted steward for future continuity.`,
      `- If they ever become unable to manage their account, you can submit a continuity request (temporary stewardship, controlled export, preservation, memorialization, or reviewed closure).`,
      `- Every continuity request is manually reviewed by Asset Safe. Nothing happens automatically.`,
      ``,
      `You don't need to do anything right now. This designation is simply on file. ${ownerName} can change or remove it at any time.`,
      ``,
      `Questions? Reach us at ${SUPPORT_EMAIL}.`,
      ``,
      `— The Asset Safe Team`,
    ].join('\n');

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: FROM,
        to: [toEmail],
        subject,
        html,
        text,
        reply_to: SUPPORT_EMAIL,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error('Resend send failed', res.status, errBody);
      return new Response(JSON.stringify({ error: 'Email send failed', detail: errBody }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('send-legacy-admin-notification error', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
