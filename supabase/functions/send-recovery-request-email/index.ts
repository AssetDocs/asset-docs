import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

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

    console.log("Sending recovery request email to:", ownerEmail);

    const emailResponse = await resend.emails.send({
      from: "Asset Safe <support@assetsafe.net>",
      to: [ownerEmail],
      subject: "Recovery Request for Your Encrypted Secure Vault",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .logo { max-width: 150px; height: auto; }
              .content { background: #f9f9f9; padding: 20px; border-radius: 8px; }
              .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
              .button { display: inline-block; padding: 12px 24px; background: #0ea5e9; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 15px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <img src="https://www.getassetsafe.com/lovable-uploads/asset-safe-logo-email-v2.jpg" alt="Asset Safe" class="logo" />
              </div>
              
              <div class="content">
                <h2>Recovery Request for Your Encrypted Secure Vault</h2>
                
                <p>Hello ${ownerName},</p>
                
                <p>Your designated Recovery Delegate, <strong>${delegateName}</strong>, has requested access to your encrypted <strong>Secure Vault</strong> (Password Catalog & Legacy Locker).</p>
                
                ${requestReason ? `<p><strong>Reason provided:</strong> ${requestReason}</p>` : ''}
                
                <div class="warning">
                  <strong>⚠️ Important:</strong> If you take no action, access will be automatically granted after <strong>${gracePeriodDays} days</strong>.
                </div>
                
                <p>To review this request and take action:</p>
                <ul>
                  <li>Approve the request to grant immediate access</li>
                  <li>Deny the request to prevent access</li>
                  <li>Take no action and the request will be automatically approved after the grace period</li>
                </ul>
                
                <center>
                  <a href="https://www.getassetsafe.com/account" class="button">Review Request</a>
                </center>
              </div>
              
              <div class="footer">
                <p>This is an automated security notification from Asset Safe.</p>
                <p>If you did not designate a Recovery Delegate, please contact support@assetsafe.net immediately.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Recovery request email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending recovery request email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
