import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentReminderRequest {
  email: string;
  customerName: string;
  subscriptionTier: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const resendKey = Deno.env.get("RESEND_API_KEY");

  if (!supabaseUrl || !serviceKey || !resendKey) {
    console.error("Missing environment variables");
    return new Response(
      JSON.stringify({ error: "Missing required environment variables" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const { email, customerName, subscriptionTier }: PaymentReminderRequest = await req.json();

    const resend = new Resend(resendKey);

    const emailResponse = await resend.emails.send({
      from: "AssetDocs <noreply@assetdocs.net>",
      to: [email],
      subject: "Action Required: Update Your Payment Method",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Update Your Payment Method</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #ffffff; padding: 30px 20px; border: 1px solid #e0e0e0; border-top: none; }
              .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
              .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
              .button:hover { background: #5a67d8; }
              .warning-box { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0; }
              .highlight { background: #e8f4fd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #667eea; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 28px;">Payment Method Update Required</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">AssetDocs</p>
              </div>
              
              <div class="content">
                <p style="font-size: 18px; margin-bottom: 20px;">Hi ${customerName},</p>
                
                <div class="warning-box">
                  <strong>⚠️ Action Required:</strong> We've detected an issue with your payment method for your ${subscriptionTier} subscription.
                </div>
                
                <p>We were unable to process your recent payment due to one of the following reasons:</p>
                <ul>
                  <li>Your card has expired</li>
                  <li>Your card was declined</li>
                  <li>Insufficient funds</li>
                  <li>Your payment method needs to be updated</li>
                </ul>
                
                <div class="highlight">
                  <strong>Don't worry!</strong> Your account is still active, but to ensure uninterrupted service, please update your payment method as soon as possible.
                </div>
                
                <p>To update your payment information:</p>
                <ol>
                  <li>Log in to your AssetDocs account</li>
                  <li>Go to Account Settings → Billing</li>
                  <li>Update your payment method</li>
                  <li>Or use the quick link below</li>
                </ol>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://assetdocs.net/account" class="button">Update Payment Method</a>
                </div>
                
                <p><strong>Need help?</strong> Our support team is here to assist you:</p>
                <ul>
                  <li>Email: <a href="mailto:support@assetdocs.net">support@assetdocs.net</a></li>
                  <li>Visit: <a href="https://assetdocs.net/contact">Contact Support</a></li>
                </ul>
                
                <p style="margin-top: 30px;">Thank you for being a valued AssetDocs customer!</p>
                
                <p style="margin-top: 20px;">
                  Best regards,<br>
                  <strong>The AssetDocs Team</strong>
                </p>
              </div>
              
              <div class="footer">
                <p>AssetDocs - Professional Asset Documentation Platform</p>
                <p>This is an automated message. Please do not reply to this email.</p>
                <p>If you no longer wish to receive these emails, you can <a href="https://assetdocs.net/account">manage your preferences</a> in your account settings.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Payment reminder email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: emailResponse.data?.id 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in send-payment-reminder function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);