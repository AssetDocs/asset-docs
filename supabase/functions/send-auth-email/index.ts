import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AuthEmailRequest {
  user: {
    id: string;
    email: string;
    user_metadata?: {
      first_name?: string;
      last_name?: string;
    };
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: AuthEmailRequest = await req.json();
    const { user, email_data } = payload;
    
    console.log("Auth email request:", { 
      email: user.email, 
      action: email_data.email_action_type,
      user_id: user.id,
      redirect_to: email_data.redirect_to 
    });

    // Validate required fields
    if (!user.email || !email_data.email_action_type || !email_data.token_hash) {
      throw new Error("Missing required fields in auth email request");
    }

    // Check if Resend API key is configured
    if (!Deno.env.get("RESEND_API_KEY")) {
      throw new Error("RESEND_API_KEY environment variable is not configured");
    }

    const displayName = user.user_metadata?.first_name || "Valued User";
    // Use the actual app domain instead of Supabase's site_url
    const appUrl = "https://assetdocs.net";
    const confirmationUrl = `${appUrl}/auth/callback?token_hash=${email_data.token_hash}&type=${email_data.email_action_type}&redirect_to=${encodeURIComponent(email_data.redirect_to || "/account")}`;

    let subject = "";
    let html = "";

    switch (email_data.email_action_type) {
      case "signup":
      case "email_change_confirm_new":
        subject = "Verify Your Email - Asset Docs";
        html = createEmailVerificationTemplate(displayName, confirmationUrl, user.email);
        break;
      
      case "recovery":
        subject = "Reset Your Password - Asset Docs";
        html = createPasswordResetTemplate(displayName, confirmationUrl, user.email);
        break;
      
      case "magiclink":
        subject = "Your Magic Link - Asset Docs";
        html = createMagicLinkTemplate(displayName, confirmationUrl, user.email);
        break;
      
      default:
        throw new Error(`Unsupported email action type: ${email_data.email_action_type}`);
    }

    // Send email with a hard timeout to avoid Supabase 5s hook timeouts
    const sendPromise = resend.emails
      .send({
        from: "Asset Docs <noreply@assetdocs.net>",
        to: [user.email],
        subject,
        html,
      })
      .then((resp) => {
        console.log("Auth email sent successfully:", resp);
        return { ok: true } as const;
      })
      .catch((err) => {
        console.error("Resend send() failed:", err);
        return { ok: false, error: String(err?.message || err) } as const;
      });

    const timeoutMs = 4500; // keep under GoTrue 5s limit
    const timeoutPromise = new Promise<{ ok: true; timeout: true }>((resolve) =>
      setTimeout(() => resolve({ ok: true, timeout: true }), timeoutMs)
    );

    const result = await Promise.race([sendPromise, timeoutPromise]);

    // Always return 200 quickly so signup never fails due to email delays
    return new Response(
      JSON.stringify({
        success: true,
        queued: "timeout" in (result as any) ? true : false,
        note: "Email send initiated",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-auth-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

function createEmailVerificationTemplate(displayName: string, confirmationUrl: string, email: string): string {
  return `
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
        <a href="${confirmationUrl}" 
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
        ${confirmationUrl}
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
  `;
}

function createPasswordResetTemplate(displayName: string, resetUrl: string, email: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #dc2626; font-size: 28px; margin: 0;">Reset Your Password</h1>
      </div>
      
      <p style="font-size: 18px; color: #333; margin-bottom: 20px;">
        Hi ${displayName},
      </p>
      
      <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
        We received a request to reset the password for your Asset Docs account. If you requested this change, click the button below to set a new password.
      </p>
      
      <div style="text-align: center; margin: 40px 0;">
        <a href="${resetUrl}" 
           style="background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px; box-shadow: 0 4px 6px rgba(220, 38, 38, 0.3);">
          🔑 Reset Password
        </a>
      </div>
      
      <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #dc2626;">
        <h3 style="color: #dc2626; font-size: 18px; margin-top: 0;">🔒 Security Notice</h3>
        <ul style="color: #7f1d1d; margin: 10px 0; padding-left: 20px; line-height: 1.6;">
          <li>This link will expire in 1 hour for security</li>
          <li>If you didn't request this, please ignore this email</li>
          <li>Consider using a strong, unique password</li>
        </ul>
      </div>
      
      <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
        If the button above doesn't work, copy and paste this link into your browser:
      </p>
      
      <p style="background: #f8fafc; padding: 15px; border-radius: 5px; word-break: break-all; color: #dc2626; border: 1px solid #e2e8f0;">
        ${resetUrl}
      </p>
      
      <p style="color: #666; margin-bottom: 30px;">
        Need help? Contact our support team at 
        <a href="mailto:info@assetdocs.net" style="color: #1e40af;">info@assetdocs.net</a>.
      </p>
      
      <p style="color: #666; margin-bottom: 30px;">
        Best regards,<br>
        <strong>The Asset Docs Team</strong>
      </p>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
      
      <p style="color: #9ca3af; font-size: 12px; text-align: center;">
        This email was sent to ${email}. This is an automated message, please do not reply.
      </p>
    </div>
  `;
}

function createMagicLinkTemplate(displayName: string, magicUrl: string, email: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #059669; font-size: 28px; margin: 0;">Your Magic Link</h1>
      </div>
      
      <p style="font-size: 18px; color: #333; margin-bottom: 20px;">
        Hi ${displayName},
      </p>
      
      <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
        Click the magic link below to securely sign in to your Asset Docs account. No password required!
      </p>
      
      <div style="text-align: center; margin: 40px 0;">
        <a href="${magicUrl}" 
           style="background: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px; box-shadow: 0 4px 6px rgba(5, 150, 105, 0.3);">
          ✨ Sign In with Magic Link
        </a>
      </div>
      
      <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #059669;">
        <p style="color: #047857; margin: 0; font-size: 14px;">
          🔒 <strong>Secure:</strong> This magic link will expire in 15 minutes and can only be used once.
        </p>
      </div>
      
      <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
        If the button above doesn't work, copy and paste this link into your browser:
      </p>
      
      <p style="background: #f8fafc; padding: 15px; border-radius: 5px; word-break: break-all; color: #059669; border: 1px solid #e2e8f0;">
        ${magicUrl}
      </p>
      
      <p style="color: #666; margin-bottom: 30px;">
        Questions? Contact our support team at 
        <a href="mailto:info@assetdocs.net" style="color: #1e40af;">info@assetdocs.net</a>.
      </p>
      
      <p style="color: #666; margin-bottom: 30px;">
        Best regards,<br>
        <strong>The Asset Docs Team</strong>
      </p>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
      
      <p style="color: #9ca3af; font-size: 12px; text-align: center;">
        This email was sent to ${email}. This is an automated message, please do not reply.
      </p>
    </div>
  `;
}

serve(handler);