import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentReminderRequest {
  email: string;
  customerName: string;
  subscriptionTier: string;
  userId?: string;
}

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
    const { email, customerName, subscriptionTier, userId }: PaymentReminderRequest = await req.json();

    const supabase = createClient(supabaseUrl, serviceKey);
    let shouldSend = true;

    if (userId) {
      const { data: preferences } = await supabase
        .from("notification_preferences")
        .select("email_notifications, billing_notifications")
        .eq("user_id", userId)
        .single();
      if (preferences && (preferences.email_notifications === false || preferences.billing_notifications === false)) {
        shouldSend = false;
      }
    }

    if (!shouldSend) {
      return new Response(JSON.stringify({ success: true, skipped: true, reason: "User has disabled billing notifications" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const resend = new Resend(resendKey);
    const accountUrl = "https://www.getassetsafe.com/account";

    const emailResponse = await resend.emails.send({
      from: "Asset Safe <noreply@assetsafe.net>",
      to: [email],
      subject: "Action Required: Update Your Payment Method — Asset Safe",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8fafc;">
          <div style="text-align: center; padding: 30px 20px 20px;">
            <img src="https://www.getassetsafe.com/lovable-uploads/asset-safe-logo-email-v2.jpg" alt="Asset Safe" style="max-width: 200px;" />
          </div>

          <div style="background: #ffffff; padding: 30px 25px; margin: 0 20px; border-radius: 8px;">
            <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 22px;">Payment Method Update Required</h2>

            <p style="color: #374151; line-height: 1.6; margin: 0 0 20px;">Hi ${customerName},</p>

            <div style="background: #fef3cd; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; margin: 0 0 20px;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                <strong>⚠️ Action Required:</strong> We were unable to process your recent payment for your ${subscriptionTier} subscription.
              </p>
            </div>

            <p style="color: #374151; line-height: 1.6; margin: 0 0 15px;">This may be because your card expired, was declined, or needs to be updated.</p>

            <div style="background: #f0f9ff; border-left: 4px solid #1e40af; padding: 12px 16px; border-radius: 4px; margin: 0 0 20px;">
              <p style="color: #1e3a8a; margin: 0; font-size: 14px;">
                <strong>Your account is still active</strong> — update your payment method soon to avoid any interruption.
              </p>
            </div>

            <div style="text-align: center; margin: 0 0 20px;">
              <a href="${accountUrl}" style="background-color: #1e40af; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
                Update Payment Method
              </a>
            </div>

            <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0 0 20px;">
              If the button doesn't work, copy and paste this link into your browser:<br/>
              <a href="${accountUrl}" style="color: #1e40af; word-break: break-all;">${accountUrl}</a>
            </p>

            <p style="color: #374151; line-height: 1.6; margin: 0; font-size: 14px;">
              Questions? Contact us at <a href="mailto:support@assetsafe.net" style="color: #1e40af;">support@assetsafe.net</a>
            </p>
          </div>

          <div style="padding: 20px; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              You can <a href="${accountUrl}" style="color: #1e40af;">manage your notification preferences</a> in your account settings.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Payment reminder email sent:", emailResponse);

    return new Response(JSON.stringify({ success: true, messageId: emailResponse.data?.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error: any) {
    console.error("Error in send-payment-reminder:", error);
    return new Response(JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
};

serve(handler);
