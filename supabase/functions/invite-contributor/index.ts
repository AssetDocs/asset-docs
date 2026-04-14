/**
 * invite-contributor — Legacy function, now delegates to send-invite patterns.
 * Uses the new 2-tier role model: full_access / read_only.
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
  contributor_email: z.string().email().max(255),
  first_name: z.string().trim().min(1).max(100),
  last_name: z.string().trim().min(1).max(100),
  role: z.enum(['full_access', 'read_only']),
  redirect_url: z.string().url().optional(),
  resend: z.boolean().optional().default(false),
});

const escapeHtml = (str: string): string =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseAdmin.auth.getUser(token);
    if (claimsError || !claimsData.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callerUser = claimsData.user;
    const body = await req.json();
    const validated = inviteSchema.parse(body);

    const { data: callerProfile } = await supabaseAdmin
      .from('profiles')
      .select('first_name, last_name')
      .eq('user_id', callerUser.id)
      .single();

    const inviterName = callerProfile
      ? `${callerProfile.first_name || ''} ${callerProfile.last_name || ''}`.trim() || callerUser.email
      : callerUser.email;

    const inviteToken = crypto.randomUUID();

    if (!validated.resend) {
      const { error: dbError } = await supabaseAdmin
        .from('contributors')
        .insert({
          account_owner_id: callerUser.id,
          contributor_email: validated.contributor_email,
          first_name: validated.first_name,
          last_name: validated.last_name,
          role: validated.role === 'full_access' ? 'contributor' : 'viewer',
          status: 'pending',
          invite_token: inviteToken,
        });

      if (dbError) {
        if (dbError.code === '23505') {
          return new Response(JSON.stringify({ error: 'This email is already invited as an authorized user', code: 'DUPLICATE' }), {
            status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw dbError;
      }
    } else {
      const { error: updateError } = await supabaseAdmin
        .from('contributors')
        .update({ invite_token: inviteToken })
        .eq('account_owner_id', callerUser.id)
        .eq('contributor_email', validated.contributor_email)
        .eq('status', 'pending');

      if (updateError) {
        console.error('[INVITE-CONTRIBUTOR] Error updating invite_token on resend:', updateError);
        throw updateError;
      }
    }

    let existingUserId: string | null = null;
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: validated.contributor_email,
      email_confirm: true,
      user_metadata: {
        first_name: validated.first_name,
        last_name: validated.last_name,
        invited_as_contributor: true,
      },
    });

    if (createError) {
      if (createError.message?.includes('already been registered') || (createError as any).status === 422) {
        const { data: userList } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
        const found = userList?.users?.find(u => u.email === validated.contributor_email);
        existingUserId = found?.id || null;
        if (existingUserId) {
          await supabaseAdmin.auth.admin.updateUserById(existingUserId, {
            email_confirm: true,
            user_metadata: { ...(found?.user_metadata ?? {}), invited_as_contributor: true },
          });
        }
      }
    } else if (newUser?.user) {
      existingUserId = newUser.user.id;
    }

    const inviteLink = `https://www.getassetsafe.com/auth?mode=contributor&email=${encodeURIComponent(validated.contributor_email)}&token=${inviteToken}`;
    const safeInviterName = escapeHtml(inviterName || '');
    const safeContributorName = escapeHtml(`${validated.first_name} ${validated.last_name}`);
    const roleLabel = validated.role === 'full_access' ? 'Full Access' : 'Read Only';
    const roleDescription = validated.role === 'full_access'
      ? 'Can view, add, update, and manage information across the account, including certain settings and authorized users.'
      : 'Can view shared information but cannot make any changes.';

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    await resend.emails.send({
      from: "Asset Safe <noreply@assetsafe.net>",
      to: [validated.contributor_email],
      subject: `You've been invited to access ${inviterName}'s Asset Safe account`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8fafc;">
          <div style="text-align: center; padding: 30px 20px 20px;">
            <img src="https://www.getassetsafe.com/lovable-uploads/asset-safe-logo-email-v2.jpg" alt="Asset Safe" style="max-width: 200px;" />
          </div>

          <div style="background: #ffffff; padding: 30px 25px; margin: 0 20px; border-radius: 8px;">
            <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 22px;">You've Been Invited</h2>

            <p style="color: #374151; line-height: 1.6; margin: 0 0 20px;">
              Hello ${safeContributorName}! <strong>${safeInviterName}</strong> has invited you to access their Asset Safe account as an authorized user.
            </p>

            <div style="background: #f3f4f6; padding: 16px 20px; border-radius: 6px; margin: 0 0 20px;">
              <p style="color: #374151; margin: 0 0 6px; font-size: 14px;"><strong>Your access level:</strong> ${roleLabel}</p>
              <p style="color: #6b7280; margin: 0; font-size: 14px;">${roleDescription}</p>
            </div>

            <p style="color: #374151; line-height: 1.6; margin: 0 0 25px;">
              This allows you to securely access important records and information when it matters most.
            </p>

            <div style="text-align: center; margin: 0 0 20px;">
              <a href="${inviteLink}" style="background-color: #1e40af; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
                Accept Invitation
              </a>
            </div>

            <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0 0 25px;">
              If the button doesn't work, copy and paste this link into your browser:<br/>
              <a href="${inviteLink}" style="color: #1e40af; word-break: break-all;">${inviteLink}</a>
            </p>

            <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px 16px; border-radius: 4px; margin: 0 0 20px;">
              <p style="color: #374151; margin: 0; font-size: 14px;">
                🔒 <strong>For your security,</strong> you'll create your own login — you'll never be given someone else's password.
              </p>
            </div>

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

    console.log('[INVITE-CONTRIBUTOR] Email sent to:', validated.contributor_email);

    return new Response(JSON.stringify({
      success: true,
      message: validated.resend ? 'Invitation resent' : 'Invitation sent',
      isResend: validated.resend,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    const errorId = crypto.randomUUID();
    console.error('[INVITE-CONTRIBUTOR] Error:', { errorId, message: error.message });

    let userMessage = 'Failed to send invitation. Please try again.';
    let status = 500;

    if (error instanceof z.ZodError) {
      userMessage = 'Invalid input data. Please check your information.';
      status = 400;
    }

    return new Response(JSON.stringify({ error: userMessage, errorId, success: false }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
