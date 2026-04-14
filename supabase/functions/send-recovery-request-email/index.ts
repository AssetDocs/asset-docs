import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RecoveryRequestEmailData {
  ownerEmail: string;
  ownerName: string;
  delegateName: string;
  gracePeriodDays: number;
  requestReason?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ownerEmail, ownerName, delegateName, gracePeriodDays, requestReason }: RecoveryRequestEmailData = await req.json();
    const accountUrl = "https://www.getassetsafe.com/account";

    const emailResponse = await resend.emails.send({
      from: "Asset Safe <noreply@assetsafe.net>",
      to: [ownerEmail],
      subject: "Recovery Request for Your Secure Vault — Asset Safe",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8fafc;">
          <div style="text-align: center; padding: 30px 20px 20px;">
            <img src="https://www.getassetsafe.com/lovable-uploads/asset-safe-logo-email-v2.jpg" alt="Asset Safe" style="max-width: 200px;" />
          </div>

          <div style="background: #ffffff; padding: 30px 25px; margin: 0 20px; border-radius: 8px;">
            <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 22px;">Recovery Request for Your Secure Vault</h2>

            <p style="color: #374151; line-height: 1.6; margin: 0 0 20px;">Hello ${ownerName},</p>

            <p style="color: #374151; line-height: 1.6; margin: 0 0 20px;">
              Your designated Recovery Delegate, <strong>${delegateName}</strong>, has requested access to your encrypted Secure Vault (Password Catalog &amp; Legacy Locker).
            </p>

            ${requestReason ? `<p style="color: #374151; line-height: 1.6; margin: 0 0 20px;"><strong>Reason provided:</strong> ${requestReason}</p>` : ''}

            <div style="background: #fef3cd; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; margin: 0 0 20px;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                <strong>⚠️ Important:</strong> If you take no action, access will be automatically granted after <strong>${gracePeriodDays} days</strong>.
              </p>
            </div>

            <p style="color: #374151; line-height: 1.6; margin: 0 0 15px;">You can:</p>
            <ul style="color: #374151; line-height: 1.8; padding-left: 20px; margin: 0 0 25px;">
              <li><strong>Approve</strong> — grant immediate access</li>
              <li><strong>Deny</strong> — prevent access</li>
              <li><strong>Take no action</strong> — access is granted automatically after the grace period</li>
            </ul>

            <div style="text-align: center; margin: 0 0 20px;">
              <a href="${accountUrl}" style="background-color: #1e40af; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
                Review Request
              </a>
            </div>

            <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0 0 20px;">
              If the button doesn't work, copy and paste this link into your browser:<br/>
              <a href="${accountUrl}" style="color: #1e40af; word-break: break-all;">${accountUrl}</a>
            </p>
          </div>

          <div style="padding: 20px; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              This is a security notification from Asset Safe.<br/>
              If you did not designate a Recovery Delegate, please contact <a href="mailto:support@assetsafe.net" style="color: #1e40af;">support@assetsafe.net</a> immediately.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Recovery request email sent:", emailResponse);
    return new Response(JSON.stringify(emailResponse), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
  } catch (error: any) {
    console.error("Error sending recovery request email:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
};

serve(handler);
