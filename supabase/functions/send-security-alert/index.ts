import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type SecurityAlertType = 
  | "new_login" 
  | "password_changed" 
  | "email_changed" 
  | "failed_login_attempt"
  | "two_factor_enabled"
  | "two_factor_disabled";

interface SecurityAlertRequest {
  userId: string;
  email: string;
  alertType: SecurityAlertType;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    location?: string;
    timestamp?: string;
    oldEmail?: string;
    newEmail?: string;
  };
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
    const { userId, email, alertType, metadata }: SecurityAlertRequest = await req.json();

    console.log(`Security alert requested: ${alertType} for user ${userId}`);

    // Check user's security alert preferences
    const supabase = createClient(supabaseUrl, serviceKey);
    
    // First, verify the user still exists in auth (account may have been deleted)
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
    
    if (authError || !authUser?.user) {
      console.log(`User ${userId} no longer exists in auth, skipping security alert email`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          skipped: true,
          reason: "User account no longer exists"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const { data: preferences, error: prefError } = await supabase
      .from("notification_preferences")
      .select("email_notifications, security_alerts")
      .eq("user_id", userId)
      .single();
    
    if (prefError) {
      console.log("Could not fetch notification preferences, defaulting to send:", prefError.message);
    } else if (preferences && (preferences.email_notifications === false || preferences.security_alerts === false)) {
      console.log(`User ${userId} has email or security alerts disabled, skipping email`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          skipped: true,
          reason: "User has disabled notifications"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user's name from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("user_id", userId)
      .single();

    const displayName = profile?.first_name || "User";
    const timestamp = metadata?.timestamp || new Date().toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'short',
    });

    const resend = new Resend(resendKey);

    let subject = "";
    let alertTitle = "";
    let alertDescription = "";
    let alertColor = "#dc2626"; // Red for security alerts
    let actionRequired = "";

    switch (alertType) {
      case "new_login":
        subject = "New Login Detected - Asset Safe";
        alertTitle = "🔐 New Login to Your Account";
        alertDescription = `
          A new login was detected on your Asset Safe account.
          ${metadata?.ipAddress ? `<br><strong>IP Address:</strong> ${metadata.ipAddress}` : ""}
          ${metadata?.location ? `<br><strong>Location:</strong> ${metadata.location}` : ""}
          ${metadata?.userAgent ? `<br><strong>Device:</strong> ${metadata.userAgent}` : ""}
        `;
        actionRequired = "If this wasn't you, please change your password immediately and contact support.";
        break;
      
      case "password_changed":
        subject = "Password Changed - Asset Safe";
        alertTitle = "🔑 Your Password Was Changed";
        alertDescription = "The password for your Asset Safe account was successfully changed.";
        actionRequired = "If you did not make this change, please reset your password immediately and contact support.";
        break;
      
      case "email_changed":
        subject = "Email Address Changed - Asset Safe";
        alertTitle = "📧 Your Email Address Was Changed";
        alertDescription = `
          The email address for your Asset Safe account was changed.
          ${metadata?.oldEmail ? `<br><strong>Previous Email:</strong> ${metadata.oldEmail}` : ""}
          ${metadata?.newEmail ? `<br><strong>New Email:</strong> ${metadata.newEmail}` : ""}
        `;
        actionRequired = "If you did not make this change, please contact support immediately.";
        break;
      
      case "failed_login_attempt":
        subject = "Failed Login Attempt - Asset Safe";
        alertTitle = "⚠️ Failed Login Attempt Detected";
        alertDescription = `
          Multiple failed login attempts were detected on your account.
          ${metadata?.ipAddress ? `<br><strong>IP Address:</strong> ${metadata.ipAddress}` : ""}
          ${metadata?.location ? `<br><strong>Location:</strong> ${metadata.location}` : ""}
        `;
        actionRequired = "If this wasn't you, consider changing your password and enabling two-factor authentication.";
        alertColor = "#f59e0b"; // Orange for warnings
        break;
      
      case "two_factor_enabled":
        subject = "Two-Factor Authentication Enabled - Asset Safe";
        alertTitle = "🛡️ Two-Factor Authentication Enabled";
        alertDescription = "Two-factor authentication has been successfully enabled on your account.";
        actionRequired = "Your account is now more secure. Keep your recovery codes in a safe place.";
        alertColor = "#059669"; // Green for positive security action
        break;
      
      case "two_factor_disabled":
        subject = "Two-Factor Authentication Disabled - Asset Safe";
        alertTitle = "⚠️ Two-Factor Authentication Disabled";
        alertDescription = "Two-factor authentication has been disabled on your account.";
        actionRequired = "If you did not make this change, please re-enable 2FA and contact support immediately.";
        break;
      
      default:
        console.log(`Unknown alert type: ${alertType}`);
        return new Response(
          JSON.stringify({ error: "Unknown alert type" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: ${alertColor}; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <img src="https://www.getassetsafe.com/lovable-uploads/asset-safe-logo-email-v2.jpg" alt="Asset Safe" style="max-width: 150px; margin-bottom: 15px;" />
              <h1 style="margin: 0; font-size: 24px;">${alertTitle}</h1>
            </div>
            
            <div style="background: #ffffff; padding: 30px 20px; border: 1px solid #e0e0e0; border-top: none;">
              <p style="font-size: 18px; margin-bottom: 20px;">Hi ${displayName},</p>
              
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${alertColor};">
                <p style="margin: 0; color: #333;">${alertDescription}</p>
                <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">
                  <strong>Time:</strong> ${timestamp}
                </p>
              </div>
              
              <div style="background: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0; color: #991b1b; font-size: 14px;">
                  <strong>Important:</strong> ${actionRequired}
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://www.getassetsafe.com/account" 
                   style="display: inline-block; background: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-right: 10px;">
                  Review Account Settings
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                If you have any concerns about your account security, please contact us immediately at 
                <a href="mailto:support@assetsafe.net" style="color: #1e40af;">support@assetsafe.net</a>
              </p>
              
              <p style="margin-top: 30px;">
                Stay safe,<br>
                <strong>The Asset Safe Security Team</strong>
              </p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px;">
              <p style="margin: 0;">Asset Safe - Professional Asset Documentation Platform</p>
              <p style="margin: 10px 0 0 0;">
                You received this security alert because it's important for your account safety.
                <br>
                <a href="https://www.getassetsafe.com/account" style="color: #1e40af;">Manage notification preferences</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Asset Safe Security <noreply@assetsafe.net>",
      to: [email],
      subject,
      html,
    });

    console.log(`Security alert email sent successfully for ${alertType}:`, emailResponse);

    // Store notification in user_notifications table for in-app bell icon
    try {
      const { error: notifError } = await supabase
        .from("user_notifications")
        .insert({
          user_id: userId,
          title: alertTitle.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim(),
          message: actionRequired,
          type: "security",
        });

      if (notifError) {
        console.error("Failed to store notification:", notifError.message);
      } else {
        console.log("In-app notification stored for user", userId);
      }
    } catch (notifErr) {
      console.error("Error storing notification:", notifErr);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: emailResponse.data?.id 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in send-security-alert function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
