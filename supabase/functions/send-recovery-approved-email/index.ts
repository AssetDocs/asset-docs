import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RecoveryApprovedEmailData {
  delegateEmail: string;
  delegateName: string;
  ownerName: string;
  legacyLockerId?: string;
  delegateUserId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { delegateEmail, delegateName, ownerName, legacyLockerId, delegateUserId }: RecoveryApprovedEmailData = await req.json();

    const acknowledgeUrl = legacyLockerId && delegateUserId
      ? `https://www.getassetsafe.com/acknowledge-access?lockerId=${legacyLockerId}&delegateId=${delegateUserId}`
      : `https://www.getassetsafe.com/account`;

    const emailResponse = await resend.emails.send({
      from: "Asset Safe <noreply@assetsafe.net>",
      to: [delegateEmail],
      subject: "Your Access Request Has Been Approved — Asset Safe",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8fafc;">
          <div style="text-align: center; padding: 30px 20px 20px;">
            <img src="https://www.getassetsafe.com/lovable-uploads/asset-safe-logo-email-v2.jpg" alt="Asset Safe" style="max-width: 200px;" />
          </div>

          <div style="background: #ffffff; padding: 30px 25px; margin: 0 20px; border-radius: 8px;">
            <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 22px;">Your Access Request Has Been Approved</h2>

            <p style="color: #374151; line-height: 1.6; margin: 0 0 20px;">Hello ${delegateName},</p>

            <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px 16px; border-radius: 4px; margin: 0 0 20px;">
              <p style="color: #374151; margin: 0; font-size: 14px;">
                <strong>✓ Access Granted:</strong> Your recovery request for ${ownerName}'s encrypted Secure Vault has been approved.
              </p>
            </div>

            <p style="color: #374151; line-height: 1.6; margin: 0 0 15px; font-weight: 600;">What you can do:</p>
            <ul style="color: #374151; line-height: 1.8; padding-left: 20px; margin: 0 0 25px;">
              <li>Access encrypted passwords and financial accounts</li>
              <li>View Legacy Locker documents, photos, and voice notes</li>
              <li>Review important contacts and instructions</li>
            </ul>

            <div style="text-align: center; margin: 0 0 20px;">
              <a href="${acknowledgeUrl}" style="background-color: #1e40af; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
                Activate Your Access
              </a>
            </div>

            <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0 0 20px;">
              If the button doesn't work, copy and paste this link into your browser:<br/>
              <a href="${acknowledgeUrl}" style="color: #1e40af; word-break: break-all;">${acknowledgeUrl}</a>
            </p>

            <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 12px 16px; border-radius: 4px; margin: 0 0 20px;">
              <p style="color: #374151; margin: 0; font-size: 14px;">
                🔒 <strong>Security reminder:</strong> This information is highly sensitive. Please handle it with appropriate care and discretion.
              </p>
            </div>
          </div>

          <div style="padding: 20px; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              Questions? Contact <a href="mailto:support@assetsafe.net" style="color: #1e40af;">support@assetsafe.net</a>
            </p>
          </div>
        </div>
      `,
    });

    console.log("Recovery approved email sent:", emailResponse);
    return new Response(JSON.stringify(emailResponse), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
  } catch (error: any) {
    console.error("Error sending recovery approved email:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
};

serve(handler);
