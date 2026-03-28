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
  role: z.enum(['administrator', 'contributor', 'viewer']),
  redirect_url: z.string().url().optional(),
  resend: z.boolean().optional().default(false),
});

const escapeHtml = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

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

    // Get caller's profile for the invitation email
    const { data: callerProfile } = await supabaseAdmin
      .from('profiles')
      .select('first_name, last_name')
      .eq('user_id', callerUser.id)
      .single();

    const inviterName = callerProfile
      ? `${callerProfile.first_name || ''} ${callerProfile.last_name || ''}`.trim() || callerUser.email
      : callerUser.email;

    // Generate a secure invite token (no expiry — lives in DB)
    const inviteToken = crypto.randomUUID();

    // 1. Insert contributor record (skip on resend to avoid duplicate constraint)
    if (!validated.resend) {
      const { error: dbError } = await supabaseAdmin
        .from('contributors')
        .insert({
          account_owner_id: callerUser.id,
          contributor_email: validated.contributor_email,
          first_name: validated.first_name,
          last_name: validated.last_name,
          role: validated.role,
          status: 'pending',
          invite_token: inviteToken,
        });

      if (dbError) {
        if (dbError.code === '23505') {
          return new Response(JSON.stringify({ error: 'This email is already invited as a contributor', code: 'DUPLICATE' }), {
            status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw dbError;
      }
    } else {
      // On resend, update the existing record with a fresh token
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

    // 2. Ensure user exists in auth (pre-confirmed, no password)
    const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = userList?.users?.find(u => u.email === validated.contributor_email) || null;

    if (!existingUser) {
      // Create user via admin API — email_confirm: true so no verification needed
      const { error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: validated.contributor_email,
        email_confirm: true,
        user_metadata: {
          first_name: validated.first_name,
          last_name: validated.last_name,
          invited_as_contributor: true,
        },
      });
      if (createError) {
        console.error('[INVITE-CONTRIBUTOR] Error creating user:', createError);
        // Not fatal — user may already exist via a different path
      } else {
        console.log('[INVITE-CONTRIBUTOR] Created new auth user for:', validated.contributor_email);
      }
    } else {
      // Mark existing user as contributor in metadata
      await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
        email_confirm: true,
        user_metadata: {
          ...(existingUser.user_metadata ?? {}),
          invited_as_contributor: true,
        },
      });
      console.log('[INVITE-CONTRIBUTOR] Updated existing user metadata for:', validated.contributor_email);
    }

    // 3. Build direct invite link — NO Supabase magic link, NO OTP, NO expiry
    const inviteLink = `https://www.getassetsafe.com/auth?mode=contributor&email=${encodeURIComponent(validated.contributor_email)}&token=${inviteToken}`;
    console.log('[INVITE-CONTRIBUTOR] Using direct token-based invite link (no OTP/expiry)');

    // 4. Send branded invitation email via Resend
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const safeInviterName = escapeHtml(inviterName || '');
    const safeContributorName = escapeHtml(`${validated.first_name} ${validated.last_name}`);
    const safeRole = escapeHtml(validated.role);

    const getRoleDescription = (role: string) => {
      switch (role) {
        case 'administrator': return 'Full access to all account features, including managing other authorized users';
        case 'contributor': return 'Can view, upload, and manage files but cannot manage authorized users or account settings';
        case 'viewer': return 'Read-only access for sharing account overviews. Cannot upload, download, or delete files';
        default: return 'Access to the account';
      }
    };

    const roleDescription = getRoleDescription(validated.role);

    await resend.emails.send({
      from: "AssetSafe <invitations@assetsafe.net>",
      to: [validated.contributor_email],
      subject: `You've been invited to collaborate on ${inviterName}'s AssetSafe account`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="https://www.getassetsafe.com/lovable-uploads/asset-safe-logo-email-v2.jpg" alt="Asset Safe" style="max-width: 200px; margin-bottom: 20px;" />
            </div>
            
            <h2 style="color: #111827; margin-bottom: 20px;">You've been invited to collaborate!</h2>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              Hello ${safeContributorName}! <strong>${safeInviterName}</strong> (${escapeHtml(callerUser.email || '')}) has invited you to access their AssetSafe account as a <strong>${safeRole}</strong>.
            </p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 16px;">Your Role: ${safeRole.charAt(0).toUpperCase() + safeRole.slice(1)}</h3>
              <p style="color: #4b5563; margin: 0; font-size: 14px;">${roleDescription}</p>
            </div>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 30px;">
              Click the button below to accept your invitation and set up your account. This link does not expire.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${inviteLink}" 
                 style="background-color: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                Accept Invitation
              </a>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                If you have any questions, please contact us at <a href="mailto:support@assetsafe.net" style="color: #1e40af;">support@assetsafe.net</a>
              </p>
              <p style="color: #6b7280; font-size: 12px; margin: 10px 0 0 0;">
                This invitation was sent to ${escapeHtml(validated.contributor_email)}. If you didn't expect this invitation, you can safely ignore this email.
              </p>
            </div>
          </div>
        </div>
      `,
    });

    console.log('[INVITE-CONTRIBUTOR] Branded email sent successfully');

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
    console.error('[INVITE-CONTRIBUTOR] Error:', { errorId, message: error.message, stack: error.stack });

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
