/**
 * send-invite — Creates an invite for an authorized user and sends email.
 * Replaces: invite-contributor
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

    // Authenticate the caller
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

    // Validate input
    const body = await req.json();
    const validated = inviteSchema.parse(body);

    // Get the caller's account (they must be owner)
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

    // Check for existing active membership
    const { data: existingMember } = await supabaseAdmin
      .from('account_memberships')
      .select('id')
      .eq('account_id', account.id)
      .eq('status', 'active')
      .in('user_id', [
        // Find user by email
      ]);

    // Check for existing pending invite
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

    // Insert invite record
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

    const roleLabel = validated.role === 'full_access' ? 'Full Access' : 'Read Only';
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
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1a365d;">You've Been Invited</h2>
            <p>${ownerName} has invited you to access their Asset Safe account as an authorized user.</p>
            <p><strong>Your access level:</strong> ${roleLabel}</p>
            <p>You'll create your own secure login and be granted access based on the level selected for you.</p>
            <div style="margin: 30px 0;">
              <a href="${inviteUrl}" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                Accept Invitation
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">This invitation expires in 7 days.</p>
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
