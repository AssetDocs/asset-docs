import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

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
      from: "Asset Docs <onboarding@resend.dev>",
      to: [email],
      subject: "Verify Your Email - Asset Docs",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; font-size: 28px; margin: 0;">Verify Your Email</h1>
          </div>
          
          <p style="font-size: 18px; color: #333; margin-bottom: 20px;">
            Hi ${displayName},
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
            Thank you for signing up for Asset Docs! To complete your registration and start protecting your valuable assets, please verify your email address by clicking the button below.
          </p>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${verification_url}" 
               style="background: #1e40af; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px; box-shadow: 0 4px 6px rgba(30, 64, 175, 0.3);">
              ✅ Verify Your Email
            </a>
          </div>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #1e40af;">
            <h3 style="color: #1e40af; font-size: 18px; margin-top: 0;">🔐 Why verify your email?</h3>
            <ul style="color: #1e3a8a; margin: 10px 0; padding-left: 20px; line-height: 1.6;">
              <li>Secure your account and protect your data</li>
              <li>Receive important notifications about your assets</li>
              <li>Enable password recovery if needed</li>
              <li>Access all Asset Docs features</li>
            </ul>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            If the button above doesn't work, you can also copy and paste this link into your browser:
          </p>
          
          <p style="background: #f8fafc; padding: 15px; border-radius: 5px; word-break: break-all; color: #1e40af; border: 1px solid #e2e8f0;">
            ${verification_url}
          </p>
          
          <div style="background: #fef3cd; border-left: 4px solid #f59e0b; padding: 15px; margin: 30px 0;">
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              ⚠️ <strong>Important:</strong> This verification link will expire in 24 hours for security reasons.
            </p>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            If you didn't create an account with Asset Docs, you can safely ignore this email.
          </p>
          
          <p style="color: #666; margin-bottom: 30px;">
            Questions? Need help? Contact our support team at 
            <a href="mailto:info@assetdocs.net" style="color: #1e40af;">info@assetdocs.net</a>.
          </p>
          
          <p style="color: #666; margin-bottom: 30px;">
            Welcome to Asset Docs!<br>
            <strong>The Asset Docs Team</strong>
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            This email was sent to ${email}. This is an automated message, please do not reply.
          </p>
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