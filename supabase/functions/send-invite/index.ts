/**
 * send-invite — Creates an invite for an authorized user and sends email.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';
import { Resend } from "https://esm.sh/resend@2.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const inviteSchema = z.object({
  email: z.string().email().max(255),
  role: z.enum(['full_access', 'read_only']),
});

const escapeHtml = (str: string): string =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (authError || !user) throw new Error('Unauthorized');

    const body = await req.json();
    const validated = inviteSchema.parse(body);

    const { data: account, error: accErr } = await supabaseAdmin
      .from('accounts')
      .select('id')
      .eq('owner_user_id', user.id)
      .single();

    if (accErr || !account) {
      return new Response(JSON.stringify({ error: 'You must be an account owner to send invites.', success: false }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: existingInvite } = await supabaseAdmin
      .from('invites')
      .select('id')
      .eq('account_id', account.id)
      .eq('email', validated.email)
      .eq('status', 'pending')
      .maybeSingle();

    if (existingInvite) {
      return new Response(JSON.stringify({ error: 'An invite is already pending for this email.', success: false }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate secure token
    const tokenBytes = new Uint8Array(32);
    crypto.getRandomValues(tokenBytes);
    const rawToken = Array.from(tokenBytes, b => b.toString(16).padStart(2, '0')).join('');

    // Hash token with SHA-256
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(rawToken));
    const tokenHash = Array.from(new Uint8Array(hashBuffer), b => b.toString(16).padStart(2, '0')).join('');

    const { error: insertErr } = await supabaseAdmin
      .from('invites')
      .insert({
        account_id: account.id,
        email: validated.email,
        role: validated.role,
        token_hash: tokenHash,
        invited_by: user.id,
      });

    if (insertErr) {
      console.error('[SEND-INVITE] Insert error:', insertErr);
      throw insertErr;
    }

    // Get owner profile for email
    const { data: ownerProfile } = await supabaseAdmin
      .from('profiles')
      .select('first_name, last_name')
      .eq('user_id', user.id)
      .single();

    const ownerName = ownerProfile
      ? `${ownerProfile.first_name || ''} ${ownerProfile.last_name || ''}`.trim()
      : 'An Asset Safe user';

    const safeOwnerName = escapeHtml(ownerName);
    const roleLabel = validated.role === 'full_access' ? 'Full Access' : 'Read Only';
    const roleDescription = validated.role === 'full_access'
      ? 'You\'ll be able to view, add, update, and manage information across the account.'
      : 'You\'ll be able to view important information, but not make changes.';
    const inviteUrl = `https://www.getassetsafe.com/invite?token=${rawToken}`;

    // Send email via Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      await resend.emails.send({
        from: 'Asset Safe <noreply@assetsafe.net>',
        to: [validated.email],
        subject: "You've been invited to access an Asset Safe account",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8fafc;">
            <div style="text-align: center; padding: 30px 20px 20px;">
              <img src="https://www.getassetsafe.com/lovable-uploads/asset-safe-logo-email-v2.jpg" alt="Asset Safe" style="max-width: 200px;" />
            </div>

            <div style="background: #ffffff; padding: 30px 25px; margin: 0 20px; border-radius: 8px;">
              <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 22px;">You've Been Invited</h2>

              <p style="color: #374151; line-height: 1.6; margin: 0 0 20px;">
                <strong>${safeOwnerName}</strong> has invited you to access their Asset Safe account as an authorized user.
              </p>

              <div style="background: #f3f4f6; padding: 16px 20px; border-radius: 6px; margin: 0 0 20px;">
                <p style="color: #374151; margin: 0 0 6px; font-size: 14px;"><strong>Your access level:</strong> ${roleLabel}</p>
                <p style="color: #6b7280; margin: 0; font-size: 14px;">${roleDescription}</p>
              </div>

              <p style="color: #374151; line-height: 1.6; margin: 0 0 25px;">
                This allows you to securely access important records and information when it matters most.
              </p>

              <div style="text-align: center; margin: 0 0 20px;">
                <a href="${inviteUrl}" style="background-color: #1e40af; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
                  Accept Invitation
                </a>
              </div>

              <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0 0 25px;">
                If the button doesn't work, copy and paste this link into your browser:<br/>
                <a href="${inviteUrl}" style="color: #1e40af; word-break: break-all;">${inviteUrl}</a>
              </p>

              <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px 16px; border-radius: 4px; margin: 0 0 20px;">
                <p style="color: #374151; margin: 0; font-size: 14px;">
                  🔒 <strong>For your security,</strong> you'll create your own login — you'll never be given someone else's password.
                </p>
              </div>

              <p style="color: #6b7280; font-size: 13px; margin: 0 0 10px;">
                This invitation will expire in 7 days for security purposes.
              </p>

              <p style="color: #6b7280; font-size: 13px; margin: 0;">
                If you don't recognize the person who sent this invitation, you can safely ignore this email.
              </p>
            </div>

            <div style="padding: 25px 20px; text-align: center;">
              <p style="color: #6b7280; font-size: 13px; font-weight: 600; margin: 0 0 6px;">What is Asset Safe?</p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0; line-height: 1.5;">
                Asset Safe helps people securely document and protect important information for their home, assets, and family.
              </p>
            </div>
          </div>
        `,
      });
      console.log('[SEND-INVITE] Email sent to:', validated.email);
    } else {
      console.warn('[SEND-INVITE] No RESEND_API_KEY, skipping email');
    }

    // Log activity
    try {
      await supabaseAdmin.from('user_activity_logs').insert({
        user_id: user.id,
        actor_user_id: user.id,
        action_type: 'invite_sent',
        action_category: 'authorized_users',
        resource_type: 'invite',
        resource_name: validated.email,
        details: { role: validated.role },
      });
    } catch (e) {
      console.error('[SEND-INVITE] Activity log error:', e);
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Invitation sent to ${validated.email}`,
    }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error('[SEND-INVITE] Error:', error);
    let message = 'Failed to send invitation.';
    let status = 500;
    if (error instanceof z.ZodError) { message = 'Invalid input.'; status = 400; }
    return new Response(JSON.stringify({ error: message, success: false }), {
      status, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
