import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerificationEmailRequest {
  email: string;
  verification_url: string;
  first_name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, verification_url, first_name }: VerificationEmailRequest = await req.json();

    console.log("Sending verification email for:", { email, first_name });

    const displayName = first_name || "Valued User";

    // Send verification email
    const emailResponse = await resend.emails.send({
      from: "Asset Safe <noreply@assetsafe.net>",
      to: [email],
      subject: "Verify your email to complete your subscription",
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 40px 20px; text-align: center;">
            <img src="https://www.assetsafe.net/lovable-uploads/asset-safe-logo-email-v2.jpg" alt="Asset Safe" style="max-width: 200px; margin-bottom: 20px;" />
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Almost There!</h1>
          </div>
          
          <div style="padding: 40px 20px; background: #ffffff;">
            <p style="font-size: 18px; margin-bottom: 20px;">Hi ${displayName},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Thank you for choosing Asset Safe! You're just one click away from starting your 30-day free trial.
            </p>
            
            <p style="font-size: 16px; margin-bottom: 30px;">
              Please verify your email address to complete your subscription setup:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verification_url}" 
                 style="display: inline-block; background: #f97316; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                Verify Email & Continue
              </a>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px;">What happens next?</h3>
              <ol style="margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Click the verification button above</li>
                <li style="margin-bottom: 8px;">Complete your payment setup (you won't be charged for 30 days)</li>
                <li style="margin-bottom: 8px;">Start documenting and protecting your valuable assets</li>
              </ol>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              If the button doesn't work, you can copy and paste this link into your browser:<br>
              <a href="${verification_url}" style="color: #f97316; word-break: break-all;">${verification_url}</a>
            </p>
            
            <p style="font-size: 14px; color: #666; margin-top: 20px;">
              Questions? We're here to help! Contact us at support@assetsafe.net
            </p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
            <p style="margin: 0;">
              This email was sent to ${email}. If you didn't request this verification, you can safely ignore this email.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Verification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, message: "Verification email sent successfully" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-verification-email function:", error);
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