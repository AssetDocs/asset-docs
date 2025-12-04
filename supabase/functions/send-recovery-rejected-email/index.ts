import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

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

    console.log("Sending recovery rejected email to:", delegateEmail);

    const emailResponse = await resend.emails.send({
      from: "Asset Safe <support@assetsafe.net>",
      to: [delegateEmail],
      subject: "Access Request Denied",
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
              .info { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 15px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <img src="https://www.assetsafe.net/lovable-uploads/asset-safe-logo-email-v2.jpg" alt="Asset Safe" class="logo" />
              </div>
              
              <div class="content">
                <h2>Access Request Denied</h2>
                
                <p>Hello ${delegateName},</p>
                
                <div class="info">
                  The account owner has denied your request to access the encrypted Secure Vault (Password Catalog & Legacy Locker) for ${ownerName}.
                </div>
                
                <p><strong>What this means:</strong></p>
                <ul>
                  <li>You will not be able to access the encrypted contents</li>
                  <li>The account owner has been notified of your request</li>
                  <li>You may contact the account owner directly if you have questions</li>
                </ul>
                
                <p>If you believe this denial was made in error or if you have concerns about the account owner's wellbeing, please contact support@assetsafe.net</p>
              </div>
              
              <div class="footer">
                <p>This is an automated notification from Asset Safe.</p>
                <p>For questions or concerns, contact support@assetsafe.net</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Recovery rejected email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending recovery rejected email:", error);
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
