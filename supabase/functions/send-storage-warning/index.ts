import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StorageWarningRequest {
  email: string;
  name: string;
  usedGB: number;
  totalGB: number;
  percentUsed: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, usedGB, totalGB, percentUsed }: StorageWarningRequest = await req.json();

    if (!email || !name || usedGB === undefined || totalGB === undefined) {
      return new Response(JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const upgradeUrl = "https://www.getassetsafe.com/account-settings?tab=subscription";

    const emailResponse = await resend.emails.send({
      from: "Asset Safe <noreply@assetsafe.net>",
      to: [email],
      subject: "Storage Quota Warning — Asset Safe",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8fafc;">
          <div style="text-align: center; padding: 30px 20px 20px;">
            <img src="https://www.getassetsafe.com/lovable-uploads/asset-safe-logo-email-v2.jpg" alt="Asset Safe" style="max-width: 200px;" />
          </div>

          <div style="background: #ffffff; padding: 30px 25px; margin: 0 20px; border-radius: 8px;">
            <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 22px;">⚠️ Storage Quota Warning</h2>

            <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 12px 16px; border-radius: 4px; margin: 0 0 20px;">
              <p style="color: #374151; margin: 0; font-size: 15px;">
                Hi ${name}, you're using <strong>${usedGB}GB</strong> of your <strong>${totalGB}GB</strong> storage limit (<strong>${percentUsed}%</strong>).
              </p>
            </div>

            <p style="color: #374151; line-height: 1.6; margin: 0 0 15px; font-weight: 600;">What happens when storage is full?</p>
            <ul style="color: #374151; line-height: 1.8; padding-left: 20px; margin: 0 0 20px;">
              <li>You won't be able to upload new photos, videos, or documents</li>
              <li>Your existing files remain safe and accessible</li>
            </ul>

            <p style="color: #374151; line-height: 1.6; margin: 0 0 15px; font-weight: 600;">What you can do:</p>
            <ol style="color: #374151; line-height: 1.8; padding-left: 20px; margin: 0 0 25px;">
              <li>Upgrade your plan for more storage</li>
              <li>Delete unwanted files to free up space</li>
            </ol>

            <div style="text-align: center; margin: 0 0 20px;">
              <a href="${upgradeUrl}" style="background-color: #1e40af; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
                Upgrade Storage
              </a>
            </div>

            <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0 0 20px;">
              If the button doesn't work, copy and paste this link into your browser:<br/>
              <a href="${upgradeUrl}" style="color: #1e40af; word-break: break-all;">${upgradeUrl}</a>
            </p>

            <p style="color: #374151; font-size: 14px; margin: 0;">
              Questions? Contact us at <a href="mailto:support@assetsafe.net" style="color: #1e40af;">support@assetsafe.net</a>
            </p>
          </div>

          <div style="padding: 20px; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">Asset Safe — Protecting what matters most.</p>
          </div>
        </div>
      `,
    });

    console.log("Storage warning email sent:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
  } catch (error: any) {
    console.error("Error sending storage warning:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
};

serve(handler);
