import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const hookSecret = Deno.env.get("SEND_EMAIL_HOOK_SECRET") || "your-webhook-secret";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);
    const wh = new Webhook(hookSecret);
    
    const {
      user,
      email_data: { token, token_hash, redirect_to, email_action_type, site_url }
    } = wh.verify(payload, headers) as any;

    console.log("Sending auth email for:", { 
      email: user.email, 
      action: email_action_type 
    });

    let subject = "Confirm your email";
    let actionText = "Confirm Email";
    
    if (email_action_type === "recovery") {
      subject = "Reset your password";
      actionText = "Reset Password";
    } else if (email_action_type === "invite") {
      subject = "You're invited to Asset Docs";
      actionText = "Accept Invitation";
    }

    const confirmUrl = `${site_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`;

    const emailResponse = await resend.emails.send({
      from: "Asset Docs <onboarding@resend.dev>",
      to: [user.email],
      subject,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h2 style="color: #333; text-align: center;">Asset Docs</h2>
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>${subject}</h3>
            <p>Click the button below to ${actionText.toLowerCase()}:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmUrl}" 
                 style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                ${actionText}
              </a>
            </div>
            <p style="font-size: 14px; color: #666;">
              Or copy and paste this link into your browser:<br>
              <a href="${confirmUrl}" style="word-break: break-all;">${confirmUrl}</a>
            </p>
            <p style="font-size: 12px; color: #999; margin-top: 30px;">
              If you didn't request this, you can safely ignore this email.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Auth email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-auth-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }
};

serve(handler);