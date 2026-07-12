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
  | "two_factor_disabled"
  | "authorized_user_access";

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
    // For authorized_user_access (sent to owner):
    ownerFirstName?: string;
    authorizedUserName?: string;
    authorizedUserRole?: string;
    accountName?: string;
    accountNumber?: string;
  };
}

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  administrator: "Full Access",
  contributor: "Full Access",
  viewer: "Read Only",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const resendKey = Deno.env.get("RESEND_API_KEY");

  if (!supabaseUrl || !serviceKey || !resendKey) {
    return new Response(JSON.stringify({ error: "Missing required environment variables" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  try {
    const { userId, email, alertType, metadata }: SecurityAlertRequest = await req.json();
    console.log(`Security alert requested: ${alertType} for user ${userId}`);

    const supabase = createClient(supabaseUrl, serviceKey);
    const resend = new Resend(resendKey);
    const accountUrl = "https://getassetsafe.com/account";

    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
    if (authError || !authUser?.user) {
      return new Response(JSON.stringify({ success: true, skipped: true, reason: "User account no longer exists" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Helper to build the standardized email HTML
    const buildHtml = (opts: {
      icon: string;
      title: string;
      greetingName: string;
      description: string;
      timestamp: string;
      actionRequired: string;
      actionStyle?: "warning" | "info";
    }) => {
      const isInfo = opts.actionStyle === "info";
      const banner = isInfo
        ? `background: #eff6ff; border-left: 4px solid #1e40af;`
        : `background: #fef2f2; border-left: 4px solid #dc2626;`;
      const bannerText = isInfo ? `color: #1e3a8a;` : `color: #991b1b;`;
      return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8fafc;">
        <div style="text-align: center; padding: 30px 20px 20px;">
          <img src="https://getassetsafe.com/lovable-uploads/asset-safe-logo-email-v2.jpg" alt="Asset Safe" style="max-width: 200px;" />
        </div>
        <div style="background: #ffffff; padding: 30px 25px; margin: 0 20px; border-radius: 8px;">
          <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 22px;">${opts.icon} ${opts.title}</h2>
          <p style="color: #374151; line-height: 1.6; margin: 0 0 20px;">Hi ${opts.greetingName},</p>
          <div style="background: #f3f4f6; padding: 16px 20px; border-radius: 6px; margin: 0 0 20px;">
            <p style="color: #374151; margin: 0 0 8px; font-size: 14px;">${opts.description}</p>
            <p style="color: #6b7280; margin: 0; font-size: 13px;"><strong>Time:</strong> ${opts.timestamp}</p>
          </div>
          <div style="${banner} padding: 12px 16px; border-radius: 4px; margin: 0 0 25px;">
            <p style="${bannerText} margin: 0; font-size: 14px;">${opts.actionRequired}</p>
          </div>
          <div style="text-align: center; margin: 0 0 20px;">
            <a href="${accountUrl}" style="background-color: #1e40af; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
              Review Account Settings
            </a>
          </div>
          <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0 0 20px;">
            If the button doesn't work, copy and paste this link into your browser:<br/>
            <a href="${accountUrl}" style="color: #1e40af; word-break: break-all;">${accountUrl}</a>
          </p>
          <p style="color: #374151; line-height: 1.6; margin: 0; font-size: 14px;">
            If you have any concerns, contact us at <a href="mailto:support@assetsafe.net" style="color: #1e40af;">support@assetsafe.net</a>
          </p>
        </div>
        <div style="padding: 20px; text-align: center;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            You received this notification because of your account preferences.<br/>
            <a href="${accountUrl}?tab=notifications" style="color: #1e40af;">Manage notification preferences</a>
          </p>
        </div>
      </div>`;
    };

    // ---------- Branch: Authorized User accessed an owner's account ----------
    if (alertType === "authorized_user_access") {
      // `userId` and `email` here refer to the ACCOUNT OWNER (recipient).
      const { data: ownerPrefs } = await supabase
        .from("notification_preferences")
        .select("email_notifications, security_alerts, authorized_user_access_alerts")
        .eq("user_id", userId)
        .single();

      if (ownerPrefs && (ownerPrefs.email_notifications === false ||
          ownerPrefs.security_alerts === false ||
          ownerPrefs.authorized_user_access_alerts === false)) {
        return new Response(JSON.stringify({ success: true, skipped: true, reason: "Owner has disabled AU access notifications" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const { data: ownerProfile } = await supabase.from("profiles").select("first_name").eq("user_id", userId).single();
      const ownerName = metadata?.ownerFirstName || ownerProfile?.first_name || "there";
      const timestamp = metadata?.timestamp || new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' });

      const auName = metadata?.authorizedUserName || "An authorized user";
      const auRole = metadata?.authorizedUserRole || "Authorized User";
      const acctName = metadata?.accountName || "your shared Asset Safe account";
      const acctNumber = metadata?.accountNumber ? ` (Account #${metadata.accountNumber})` : "";

      const subject = "Authorized User Accessed Your Asset Safe Account";
      const title = "Shared Account Access Detected";
      const description = `<strong>${auName}</strong> (${auRole}) accessed <strong>${acctName}</strong>${acctNumber}.<br/><br/>This notification is part of your shared account security and activity preferences.`;
      const actionRequired = "If you do not recognize this activity, review your Authorized Users settings or contact support.";

      const html = buildHtml({
        icon: "👥",
        title,
        greetingName: ownerName,
        description,
        timestamp,
        actionRequired,
        actionStyle: "info",
      });

      const emailResponse = await resend.emails.send({
        from: "Asset Safe <noreply@assetsafe.net>",
        to: [email],
        subject,
        html,
      });
      console.log("AU access email sent:", emailResponse);

      try {
        await supabase.from("user_notifications").insert({
          user_id: userId,
          title,
          message: `${auName} (${auRole}) accessed ${acctName}.`,
          type: "security",
        });
      } catch (e) { console.error("Notification store error:", e); }

      return new Response(JSON.stringify({ success: true, messageId: emailResponse.data?.id }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ---------- Standard self-targeted alerts ----------
    const { data: preferences } = await supabase
      .from("notification_preferences")
      .select("email_notifications, security_alerts")
      .eq("user_id", userId)
      .single();

    if (preferences && (preferences.email_notifications === false || preferences.security_alerts === false)) {
      return new Response(JSON.stringify({ success: true, skipped: true, reason: "User has disabled notifications" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: profile } = await supabase.from("profiles").select("first_name").eq("user_id", userId).single();
    const displayName = profile?.first_name || "there";
    const timestamp = metadata?.timestamp || new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' });

    let subject = "", alertTitle = "", alertDescription = "", actionRequired = "", icon = "🔒", actionStyle: "warning" | "info" = "warning";

    switch (alertType) {
      case "new_login":
        subject = "New Login to Your Asset Safe Account";
        alertTitle = "New Login Detected";
        icon = "🔒";
        alertDescription = `A new login to your Asset Safe account was detected.${metadata?.ipAddress ? `<br/><strong>IP Address:</strong> ${metadata.ipAddress}` : ""}${metadata?.location ? `<br/><strong>Location:</strong> ${metadata.location}` : ""}`;
        actionRequired = "If this was not you, please change your password immediately and contact support.";
        break;
      case "password_changed":
        subject = "Password Changed — Asset Safe";
        alertTitle = "Your Password Was Changed";
        alertDescription = "The password for your Asset Safe account was successfully changed.";
        actionRequired = "If you did not make this change, please reset your password immediately and contact support.";
        break;
      case "email_changed":
        subject = "Email Address Changed — Asset Safe";
        alertTitle = "Your Email Address Was Changed";
        alertDescription = `The email address for your Asset Safe account was changed.${metadata?.oldEmail ? `<br/><strong>Previous:</strong> ${metadata.oldEmail}` : ""}${metadata?.newEmail ? `<br/><strong>New:</strong> ${metadata.newEmail}` : ""}`;
        actionRequired = "If you did not make this change, please contact support immediately.";
        break;
      case "failed_login_attempt":
        subject = "Failed Login Attempt — Asset Safe";
        alertTitle = "Failed Login Attempt Detected";
        alertDescription = `Multiple failed login attempts were detected on your account.${metadata?.ipAddress ? `<br/><strong>IP Address:</strong> ${metadata.ipAddress}` : ""}`;
        actionRequired = "If this wasn't you, consider changing your password and enabling two-factor authentication.";
        break;
      case "two_factor_enabled":
        subject = "Two-Factor Authentication Enabled — Asset Safe";
        alertTitle = "Two-Factor Authentication Enabled";
        alertDescription = "Two-factor authentication has been successfully enabled on your account.";
        actionRequired = "Your account is now more secure. Keep your recovery codes in a safe place.";
        actionStyle = "info";
        break;
      case "two_factor_disabled":
        subject = "Two-Factor Authentication Disabled — Asset Safe";
        alertTitle = "Two-Factor Authentication Disabled";
        alertDescription = "Two-factor authentication has been disabled on your account.";
        actionRequired = "If you did not make this change, please re-enable 2FA and contact support immediately.";
        break;
      default:
        return new Response(JSON.stringify({ error: "Unknown alert type" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const html = buildHtml({
      icon,
      title: alertTitle,
      greetingName: displayName,
      description: alertDescription,
      timestamp,
      actionRequired: `<strong>Important:</strong> ${actionRequired}`,
      actionStyle,
    });

    const emailResponse = await resend.emails.send({ from: "Asset Safe <noreply@assetsafe.net>", to: [email], subject, html });
    console.log(`Security alert email sent for ${alertType}:`, emailResponse);

    try {
      await supabase.from("user_notifications").insert({
        user_id: userId,
        title: alertTitle,
        message: actionRequired,
        type: "security",
      });
    } catch (e) { console.error("Notification store error:", e); }

    // ---------- For new_login: also notify owners of any shared accounts this user accesses ----------
    if (alertType === "new_login") {
      try {
        const { data: memberships } = await supabase
          .from("account_memberships")
          .select("account_id, role")
          .eq("user_id", userId)
          .eq("status", "active")
          .neq("role", "owner");

        if (memberships && memberships.length > 0) {
          const auFirst = profile?.first_name || "";
          const { data: authUserFull } = await supabase.auth.admin.getUserById(userId);
          const authMeta: any = authUserFull?.user?.user_metadata || {};
          const auLast = authMeta.last_name || "";
          const auFullName = [auFirst, auLast].filter(Boolean).join(" ").trim() || email;

          for (const m of memberships) {
            const { data: account } = await supabase
              .from("accounts")
              .select("owner_user_id, account_name")
              .eq("id", m.account_id)
              .single();
            if (!account?.owner_user_id || account.owner_user_id === userId) continue;

            const { data: ownerAuth } = await supabase.auth.admin.getUserById(account.owner_user_id);
            const ownerEmail = ownerAuth?.user?.email;
            if (!ownerEmail) continue;

            const { data: ownerProfile } = await supabase
              .from("profiles")
              .select("first_name, account_number")
              .eq("user_id", account.owner_user_id)
              .single();

            await supabase.functions.invoke("send-security-alert", {
              body: {
                userId: account.owner_user_id,
                email: ownerEmail,
                alertType: "authorized_user_access",
                metadata: {
                  timestamp,
                  ownerFirstName: ownerProfile?.first_name || "",
                  authorizedUserName: auFullName,
                  authorizedUserRole: ROLE_LABELS[m.role] || "Authorized User",
                  accountName: account.account_name || "your shared Asset Safe account",
                  accountNumber: ownerProfile?.account_number || "",
                },
              },
            });
          }
        }
      } catch (e) {
        console.error("Failed to dispatch AU access notifications:", e);
      }
    }

    return new Response(JSON.stringify({ success: true, messageId: emailResponse.data?.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error: any) {
    console.error("Error in send-security-alert:", error);
    return new Response(JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
};

serve(handler);
