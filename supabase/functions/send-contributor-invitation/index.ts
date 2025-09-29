import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContributorInvitationRequest {
  contributor_email: string;
  contributor_role: string;
  inviter_name: string;
  inviter_email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      contributor_email, 
      contributor_role, 
      inviter_name, 
      inviter_email 
    }: ContributorInvitationRequest = await req.json();

    console.log("Sending contributor invitation:", {
      contributor_email,
      contributor_role,
      inviter_name,
      inviter_email
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
      from: "AssetDocs <invitations@assetdocs.net>",
      to: [contributor_email],
      subject: `You've been invited to collaborate on ${inviter_name}'s AssetDocs account`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1e40af; margin: 0; font-size: 28px;">AssetDocs</h1>
              <p style="color: #6b7280; margin: 5px 0 0 0;">Digital Asset Documentation</p>
            </div>
            
            <h2 style="color: #111827; margin-bottom: 20px;">You've been invited to collaborate!</h2>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              Hello! <strong>${inviter_name}</strong> (${inviter_email}) has invited you to access their AssetDocs account as a <strong>${contributor_role}</strong>.
            </p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 16px;">Your Role: ${contributor_role.charAt(0).toUpperCase() + contributor_role.slice(1)}</h3>
              <p style="color: #4b5563; margin: 0; font-size: 14px;">${roleDescription}</p>
            </div>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 30px;">
              To accept this invitation and start collaborating, simply sign up or log in to AssetDocs using this email address.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://assetdocs.net/auth" 
                 style="background-color: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                Accept Invitation
              </a>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                If you have any questions, please contact us at <a href="mailto:support@assetdocs.net" style="color: #1e40af;">support@assetdocs.net</a>
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
    console.error("Error in send-contributor-invitation function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
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