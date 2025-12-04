import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Validation schema for contributor invitation
const contributorInvitationSchema = z.object({
  contributor_email: z.string().email().max(255),
  contributor_name: z.string().trim().max(200).optional(),
  contributor_role: z.enum(['administrator', 'contributor', 'viewer']),
  inviter_name: z.string().trim().min(1).max(100),
  inviter_email: z.string().email().max(255)
});

// Helper function to escape HTML
const escapeHtml = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Validate input data
    const validatedData = contributorInvitationSchema.parse(body);
    
    const { 
      contributor_email, 
      contributor_name,
      contributor_role, 
      inviter_name, 
      inviter_email 
    } = validatedData;
    
    // Escape HTML for safe email rendering
    const safeInviterName = escapeHtml(inviter_name);
    const safeContributorName = contributor_name ? escapeHtml(contributor_name) : '';
    const safeRole = escapeHtml(contributor_role);

    console.log("Sending contributor invitation:", {
      contributor_email,
      contributor_name,
      contributor_role,
      inviter_name
    });

    // Get role description
    const getRoleDescription = (role: string) => {
      switch (role) {
        case 'administrator':
          return 'Full access to all account features, including managing other contributors';
        case 'contributor':
          return 'Can view, upload, and manage files but cannot manage contributors or account settings';
        case 'viewer':
          return 'Read-only access for sharing account overviews. Cannot upload, download, or delete files';
        default:
          return 'Access to the account';
      }
    };

    const roleDescription = getRoleDescription(contributor_role);

    // Send email to the invited contributor
    const emailResponse = await resend.emails.send({
      from: "AssetSafe <invitations@assetsafe.net>",
      to: [contributor_email],
      subject: `You've been invited to collaborate on ${inviter_name}'s AssetSafe account`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="https://leotcbfpqiekgkgumecn.supabase.co/storage/v1/object/public/lovable-uploads/asset-safe-logo-email-v2.jpg" alt="Asset Safe" style="max-width: 200px; margin-bottom: 20px;" />
            </div>
            
            <h2 style="color: #111827; margin-bottom: 20px;">You've been invited to collaborate!</h2>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              Hello${safeContributorName ? ` ${safeContributorName}` : ''}! <strong>${safeInviterName}</strong> (${inviter_email}) has invited you to access their AssetSafe account as a <strong>${safeRole}</strong>.
            </p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 16px;">Your Role: ${safeRole.charAt(0).toUpperCase() + safeRole.slice(1)}</h3>
              <p style="color: #4b5563; margin: 0; font-size: 14px;">${roleDescription}</p>
            </div>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 30px;">
              To accept this invitation and start collaborating, simply sign up or log in to AssetSafe using this email address.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://www.assetsafe.net/auth?mode=contributor&email=${encodeURIComponent(contributor_email)}" 
                 style="background-color: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                Accept Invitation
              </a>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                If you have any questions, please contact us at <a href="mailto:support@assetsafe.net" style="color: #1e40af;">support@assetsafe.net</a>
              </p>
              <p style="color: #6b7280; font-size: 12px; margin: 10px 0 0 0;">
                This invitation was sent to ${contributor_email}. If you didn't expect this invitation, you can safely ignore this email.
              </p>
            </div>
          </div>
        </div>
      `,
    });

    console.log("Invitation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Invitation email sent successfully" 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    const errorId = crypto.randomUUID();
    console.error("Error in send-contributor-invitation function:", { errorId, message: error.message });
    
    let userMessage = "Failed to send invitation. Please try again.";
    if (error instanceof z.ZodError) {
      userMessage = "Invalid input data. Please check your information.";
    }
    
    return new Response(
      JSON.stringify({ 
        error: userMessage,
        errorId,
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);