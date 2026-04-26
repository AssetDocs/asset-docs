import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPPORT_EMAIL = 'support@assetsafe.net';

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

    const { request_id } = await req.json();
    if (!request_id || typeof request_id !== 'string') {
      return new Response(JSON.stringify({ error: 'request_id required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Validate caller is the requester
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

    const { data: reqRow, error: reqErr } = await admin
      .from('account_continuity_requests')
      .select('*, accounts!inner(owner_user_id, account_name)')
      .eq('id', request_id)
      .maybeSingle();

    if (reqErr || !reqRow) {
      return new Response(JSON.stringify({ error: 'Request not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (reqRow.requested_by_user_id !== userData.user.id) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const ownerId = (reqRow as any).accounts?.owner_user_id as string | undefined;
    let ownerEmail: string | null = null;
    if (ownerId) {
      const { data: ownerAuth } = await admin.auth.admin.getUserById(ownerId);
      ownerEmail = ownerAuth?.user?.email || null;
    }

    const resendKey = Deno.env.get('RESEND_API_KEY');
    const typeLabel: Record<string, string> = {
      closure: 'Account Closure',
      export: 'Data Export',
      ownership_transfer: 'Ownership Transfer',
    };
    const subject = `Continuity request: ${typeLabel[reqRow.request_type] || reqRow.request_type}`;
    const body = `
      <h2>New continuity request submitted</h2>
      <p><strong>Account:</strong> ${(reqRow as any).accounts?.account_name || reqRow.account_id}</p>
      <p><strong>Type:</strong> ${typeLabel[reqRow.request_type] || reqRow.request_type}</p>
      <p><strong>Reason:</strong> ${escapeHtml(reqRow.reason)}</p>
      ${reqRow.notes ? `<p><strong>Notes:</strong> ${escapeHtml(reqRow.notes)}</p>` : ''}
      <p><strong>Contact:</strong> ${escapeHtml(reqRow.contact_email || '')} ${escapeHtml(reqRow.contact_phone || '')}</p>
      <p>Review required before any action.</p>
    `;

    const sendEmail = async (to: string) => {
      if (!resendKey) return;
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendKey}` },
          body: JSON.stringify({
            from: 'Asset Safe <noreply@notify.getassetsafe.com>',
            to: [to],
            subject,
            html: body,
          }),
        });
      } catch (e) {
        console.warn('email send failed', to, e);
      }
    };

    await sendEmail(SUPPORT_EMAIL);
    if (ownerEmail) await sendEmail(ownerEmail);

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('notify-continuity-request error', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function escapeHtml(s: string): string {
  return (s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
