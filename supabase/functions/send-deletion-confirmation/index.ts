import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DeletionConfirmationRequest {
  email: string;
  name: string;
  deletionDate: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, deletionDate }: DeletionConfirmationRequest = await req.json();
    if (!email || !name) {
      return new Response(JSON.stringify({ error: "Email and name are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const formattedDate = new Date(deletionDate || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const emailResponse = await resend.emails.send({
      from: "Asset Safe <noreply@assetsafe.net>",
      to: [email],
      subject: "Account Deletion Confirmed — Asset Safe",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8fafc;">
          <div style="text-align: center; padding: 30px 20px 20px;">
            <img src="https://www.getassetsafe.com/lovable-uploads/asset-safe-logo-email-v2.jpg" alt="Asset Safe" style="max-width: 200px;" />
          </div>

          <div style="background: #ffffff; padding: 30px 25px; margin: 0 20px; border-radius: 8px;">
            <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 22px;">Account Deletion Confirmed</h2>

            <p style="color: #374151; line-height: 1.6; margin: 0 0 20px;">Hi ${name},</p>

            <p style="color: #374151; line-height: 1.6; margin: 0 0 20px;">
              Your Asset Safe account has been successfully deleted as of ${formattedDate}.
            </p>

            <p style="color: #374151; line-height: 1.6; margin: 0 0 10px; font-weight: 600;">What's been deleted:</p>
            <ul style="color: #374151; line-height: 1.8; padding-left: 20px; margin: 0 0 20px;">
              <li>All uploaded photos, videos, and documents</li>
              <li>Property profiles and asset inventory</li>
              <li>All personal information and account data</li>
              <li>Subscription and billing history</li>
            </ul>

            <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 12px 16px; border-radius: 4px; margin: 0 0 20px;">
              <p style="color: #374151; margin: 0; font-size: 14px;">
                <strong>Important:</strong> This action is permanent and cannot be undone. All your data has been securely removed from our systems.
              </p>
            </div>

            <p style="color: #374151; line-height: 1.6; margin: 0 0 10px;">
              If you'd like to return in the future, you can always create a new account at <a href="https://www.getassetsafe.com/auth" style="color: #1e40af;">www.getassetsafe.com</a>.
            </p>

            <p style="color: #374151; font-size: 14px; margin: 20px 0 0;">
              Questions? Contact us at <a href="mailto:support@assetsafe.net" style="color: #1e40af;">support@assetsafe.net</a>
            </p>
          </div>

          <div style="padding: 20px; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              Thank you for using Asset Safe. We hope to see you again in the future.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Deletion confirmation email sent:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
  } catch (error: any) {
    console.error("Error sending deletion confirmation:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
};

serve(handler);
