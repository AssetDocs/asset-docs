import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RecoveryRejectedEmailData {
  delegateEmail: string;
  delegateName: string;
  ownerName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { delegateEmail, delegateName, ownerName }: RecoveryRejectedEmailData = await req.json();

    const emailResponse = await resend.emails.send({
      from: "Asset Safe <noreply@assetsafe.net>",
      to: [delegateEmail],
      subject: "Access Request Denied — Asset Safe",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8fafc;">
          <div style="text-align: center; padding: 30px 20px 20px;">
            <img src="https://www.getassetsafe.com/lovable-uploads/asset-safe-logo-email-v2.jpg" alt="Asset Safe" style="max-width: 200px;" />
          </div>

          <div style="background: #ffffff; padding: 30px 25px; margin: 0 20px; border-radius: 8px;">
            <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 22px;">Access Request Denied</h2>

            <p style="color: #374151; line-height: 1.6; margin: 0 0 20px;">Hello ${delegateName},</p>

            <div style="background: #fef3cd; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; margin: 0 0 20px;">
              <p style="color: #374151; margin: 0; font-size: 14px;">
                The account owner has denied your request to access the encrypted Secure Vault for <strong>${ownerName}</strong>.
              </p>
            </div>

            <p style="color: #374151; line-height: 1.6; margin: 0 0 15px; font-weight: 600;">What this means:</p>
            <ul style="color: #374151; line-height: 1.8; padding-left: 20px; margin: 0 0 20px;">
              <li>You will not be able to access the encrypted contents</li>
              <li>The account owner has been notified of your request</li>
              <li>You may contact the account owner directly if you have questions</li>
            </ul>

            <p style="color: #374151; line-height: 1.6; margin: 0; font-size: 14px;">
              If you believe this denial was made in error, please contact <a href="mailto:support@assetsafe.net" style="color: #1e40af;">support@assetsafe.net</a>.
            </p>
          </div>

          <div style="padding: 20px; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">This is an automated notification from Asset Safe.</p>
          </div>
        </div>
      `,
    });

    console.log("Recovery rejected email sent:", emailResponse);
    return new Response(JSON.stringify(emailResponse), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
  } catch (error: any) {
    console.error("Error sending recovery rejected email:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
};

serve(handler);
