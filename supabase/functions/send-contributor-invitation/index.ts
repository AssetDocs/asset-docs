/**
 * send-contributor-invitation — Legacy email-only function.
 * Updated to use new 2-tier role model: full_access / read_only.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const contributorInvitationSchema = z.object({
  contributor_email: z.string().email().max(255),
  contributor_name: z.string().trim().max(200).optional(),
  contributor_role: z.enum(['full_access', 'read_only']),
  inviter_name: z.string().trim().min(1).max(100),
  inviter_email: z.string().email().max(255),
});

const escapeHtml = (str: string): string =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const validatedData = contributorInvitationSchema.parse(body);

    const {
      contributor_email,
      contributor_name,
      contributor_role,
      inviter_name,
      inviter_email,
    } = validatedData;

    const safeInviterName = escapeHtml(inviter_name);
    const safeContributorName = contributor_name ? escapeHtml(contributor_name) : '';
    const roleLabel = contributor_role === 'full_access' ? 'Full Access' : 'Read Only';
    const roleDescription = contributor_role === 'full_access'
      ? 'Can view, add, update, and manage information across the account, including certain settings and authorized users.'
      : 'Can view shared information but cannot make any changes.';

    const inviteLink = `https://www.getassetsafe.com/auth?mode=contributor&email=${encodeURIComponent(contributor_email)}`;

    const emailResponse = await resend.emails.send({
      from: "Asset Safe <noreply@assetsafe.net>",
      to: [contributor_email],
      subject: `You've been invited to access ${inviter_name}'s Asset Safe account`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8fafc;">
          <div style="text-align: center; padding: 30px 20px 20px;">
            <img src="https://www.getassetsafe.com/lovable-uploads/asset-safe-logo-email-v2.jpg" alt="Asset Safe" style="max-width: 200px;" />
          </div>

          <div style="background: #ffffff; padding: 30px 25px; margin: 0 20px; border-radius: 8px;">
            <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 22px;">You've Been Invited</h2>

            <p style="color: #374151; line-height: 1.6; margin: 0 0 20px;">
              Hello${safeContributorName ? ` ${safeContributorName}` : ''}! <strong>${safeInviterName}</strong> (${escapeHtml(inviter_email)}) has invited you to access their Asset Safe account as an authorized user.
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

    console.log("Invitation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({
      success: true,
      message: "Invitation email sent successfully",
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    const errorId = crypto.randomUUID();
    console.error("Error in send-contributor-invitation function:", { errorId, message: error.message });

    let userMessage = "Failed to send invitation. Please try again.";
    if (error instanceof z.ZodError) {
      userMessage = "Invalid input data. Please check your information.";
    }

    return new Response(
      JSON.stringify({ error: userMessage, errorId, success: false }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
