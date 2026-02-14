import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RecoveryApprovedEmailData {
  delegateEmail: string;
  delegateName: string;
  ownerName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { delegateEmail, delegateName, ownerName }: RecoveryApprovedEmailData = await req.json();

    console.log("Sending recovery approved email to:", delegateEmail);

    const emailResponse = await resend.emails.send({
      from: "Asset Safe <support@assetsafe.net>",
      to: [delegateEmail],
      subject: "Your Access Request Has Been Approved",
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
              .success { background: #d1fae5; border-left: 4px solid #10b981; padding: 12px; margin: 15px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <img src="https://www.getassetsafe.com/lovable-uploads/asset-safe-logo-email-v2.jpg" alt="Asset Safe" class="logo" />
              </div>
              
              <div class="content">
                <h2>Your Access Request Has Been Approved</h2>
                
                <p>Hello ${delegateName},</p>
                
                <div class="success">
                  <strong>✓ Access Granted:</strong> Your recovery request for ${ownerName}'s encrypted Secure Vault (Password Catalog & Legacy Locker) has been approved.
                </div>
                
                <p>You may now unlock and view the contents of both the Password Catalog and Legacy Locker.</p>
                
                <p><strong>What you can do:</strong></p>
                <ul>
                  <li>Access all encrypted passwords and financial accounts</li>
                  <li>View Legacy Locker documents, photos, and voice notes</li>
                  <li>Review important contacts and instructions</li>
                </ul>
                
                <center>
                  <a href="https://www.getassetsafe.com/account" class="button">Access Legacy Locker</a>
                </center>
                
                <p><strong>Security reminder:</strong> This information is highly sensitive. Please handle it with the appropriate care and discretion.</p>
              </div>
              
              <div class="footer">
                <p>This is an automated notification from Asset Safe.</p>
                <p>If you have questions, contact support@assetsafe.net</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Recovery approved email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending recovery approved email:", error);
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
