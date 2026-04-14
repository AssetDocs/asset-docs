import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GiftEmailData {
  giftCode: string;
  sessionId: string;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-GIFT-EMAIL] ${step}${detailsStr}`);
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { giftCode, sessionId }: GiftEmailData = await req.json();
    if (!giftCode || !sessionId) throw new Error("Gift code and session ID are required");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: giftSub, error: fetchError } = await supabaseClient
      .from('gift_subscriptions')
      .select('*')
      .eq('gift_code', giftCode)
      .eq('stripe_session_id', sessionId)
      .single();

    if (fetchError || !giftSub) throw new Error("Gift subscription not found");
    if (giftSub.status !== 'paid') throw new Error("Gift subscription payment not confirmed");

    const planLabel = giftSub.plan_type.charAt(0).toUpperCase() + giftSub.plan_type.slice(1);
    const redeemUrl = `https://www.getassetsafe.com/login?giftCode=${giftSub.gift_code}`;

    // Recipient email
    const recipientEmailResponse = await resend.emails.send({
      from: "Asset Safe <noreply@assetsafe.net>",
      to: [giftSub.recipient_email],
      subject: `You've received a gift subscription to Asset Safe!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8fafc;">
          <div style="text-align: center; padding: 30px 20px 20px;">
            <img src="https://www.getassetsafe.com/lovable-uploads/asset-safe-logo-email-v2.jpg" alt="Asset Safe" style="max-width: 200px;" />
          </div>

          <div style="background: #ffffff; padding: 30px 25px; margin: 0 20px; border-radius: 8px;">
            <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 22px;">🎁 You've Received a Gift!</h2>

            <p style="color: #374151; line-height: 1.6; margin: 0 0 20px;">
              <strong>${giftSub.purchaser_name}</strong> has gifted you a <strong>${planLabel} Plan</strong> subscription to Asset Safe.
            </p>

            ${giftSub.gift_message ? `
              <div style="background: #f8fafc; border-left: 4px solid #1e40af; padding: 12px 16px; border-radius: 4px; margin: 0 0 20px;">
                <p style="color: #374151; margin: 0; font-style: italic;">"${giftSub.gift_message}"</p>
              </div>
            ` : ''}

            <div style="background: #f3f4f6; padding: 16px 20px; border-radius: 6px; margin: 0 0 20px; text-align: center;">
              <p style="color: #6b7280; margin: 0 0 6px; font-size: 13px;">Your Gift Code</p>
              <p style="color: #1f2937; margin: 0; font-family: monospace; font-size: 20px; letter-spacing: 2px; font-weight: 700;">${giftSub.gift_code}</p>
            </div>

            <p style="color: #374151; line-height: 1.6; margin: 0 0 10px; font-weight: 600;">How to redeem:</p>
            <ol style="color: #374151; line-height: 1.8; padding-left: 20px; margin: 0 0 25px;">
              <li>Click the button below</li>
              <li>Create an account or sign in</li>
              <li>Your gift code will be applied automatically</li>
            </ol>

            <div style="text-align: center; margin: 0 0 20px;">
              <a href="${redeemUrl}" style="background-color: #1e40af; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
                Redeem Your Gift
              </a>
            </div>

            <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0 0 20px;">
              If the button doesn't work, copy and paste this link into your browser:<br/>
              <a href="${redeemUrl}" style="color: #1e40af; word-break: break-all;">${redeemUrl}</a>
            </p>
          </div>

          <div style="padding: 20px; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              Questions? Contact us at <a href="mailto:support@assetsafe.net" style="color: #1e40af;">support@assetsafe.net</a>.<br/>
              This gift subscription is valid for 12 months from activation.
            </p>
          </div>
        </div>
      `,
    });

    logStep("Recipient email sent", { messageId: recipientEmailResponse.data?.id });

    // Purchaser confirmation
    const purchaserEmailResponse = await resend.emails.send({
      from: "Asset Safe <noreply@assetsafe.net>",
      to: [giftSub.purchaser_email],
      subject: `Gift Subscription Sent — ${giftSub.recipient_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8fafc;">
          <div style="text-align: center; padding: 30px 20px 20px;">
            <img src="https://www.getassetsafe.com/lovable-uploads/asset-safe-logo-email-v2.jpg" alt="Asset Safe" style="max-width: 200px;" />
          </div>

          <div style="background: #ffffff; padding: 30px 25px; margin: 0 20px; border-radius: 8px;">
            <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 22px;">🎁 Gift Sent Successfully!</h2>

            <p style="color: #374151; line-height: 1.6; margin: 0 0 20px;">
              Your gift of a <strong>${planLabel} Plan</strong> has been sent to <strong>${giftSub.recipient_name}</strong> (${giftSub.recipient_email}).
            </p>

            <div style="background: #f3f4f6; padding: 16px 20px; border-radius: 6px; margin: 0 0 20px;">
              <p style="color: #374151; margin: 0 0 8px; font-size: 14px;"><strong>Recipient:</strong> ${giftSub.recipient_name}</p>
              <p style="color: #374151; margin: 0 0 8px; font-size: 14px;"><strong>Plan:</strong> ${planLabel}</p>
              <p style="color: #374151; margin: 0 0 8px; font-size: 14px;"><strong>Gift Code:</strong> ${giftSub.gift_code}</p>
              <p style="color: #374151; margin: 0; font-size: 14px;"><strong>Duration:</strong> 12 months</p>
            </div>

            <p style="color: #374151; line-height: 1.6; margin: 0 0 10px;">
              They'll receive an email with instructions on how to redeem their gift.
            </p>

            <p style="color: #374151; margin: 20px 0 0;">Thank you for giving the gift of Asset Safe!</p>
          </div>

          <div style="padding: 20px; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              Questions? Contact us at <a href="mailto:support@assetsafe.net" style="color: #1e40af;">support@assetsafe.net</a>.
            </p>
          </div>
        </div>
      `,
    });

    logStep("Purchaser confirmation email sent", { messageId: purchaserEmailResponse.data?.id });

    const { error: updateError } = await supabaseClient
      .from('gift_subscriptions')
      .update({ status: 'delivered', delivered_at: new Date().toISOString() })
      .eq('gift_code', giftCode);

    if (updateError) logStep("Failed to update gift status", updateError);

    return new Response(JSON.stringify({
      success: true,
      recipientEmailId: recipientEmailResponse.data?.id,
      purchaserEmailId: purchaserEmailResponse.data?.id,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
