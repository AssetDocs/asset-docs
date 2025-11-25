import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const { giftCode, sessionId } = await req.json();
    if (!giftCode || !sessionId) {
      throw new Error("Gift code and session ID are required");
    }

    // Use service role key for database access
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get gift subscription details
    const { data: giftSub, error: fetchError } = await supabaseClient
      .from('gift_subscriptions')
      .select('*')
      .eq('gift_code', giftCode)
      .eq('stripe_session_id', sessionId)
      .single();

    if (fetchError || !giftSub) {
      logStep("Gift subscription not found", { giftCode, sessionId, error: fetchError });
      throw new Error("Gift subscription not found");
    }

    logStep("Found gift subscription", { giftCode, status: giftSub.status });

    if (giftSub.status !== 'paid') {
      throw new Error("Gift subscription payment not confirmed");
    }

    // Send email to recipient
    const recipientEmailResponse = await resend.emails.send({
      from: "Asset Safe <noreply@assetsafe.net>",
      to: [giftSub.recipient_email],
      subject: `🎁 You've received a gift subscription to Asset Safe!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <img src="https://www.assetsafe.net/lovable-uploads/asset-safe-logo-email.jpg" alt="Asset Safe" style="max-width: 200px; margin-bottom: 20px;" />
            <h1 style="color: #2563eb; margin-bottom: 10px;">🎁 Congratulations!</h1>
            <h2 style="color: #1f2937; margin: 0;">You've received a gift subscription to Asset Safe</h2>
          </div>
          
          <div style="background: #f8fafc; border-radius: 8px; padding: 30px; margin-bottom: 30px;">
            <p style="font-size: 18px; color: #374151; margin-bottom: 20px;">
              <strong>${giftSub.purchaser_name}</strong> has gifted you a <strong>${giftSub.plan_type.charAt(0).toUpperCase() + giftSub.plan_type.slice(1)} Plan</strong> subscription to Asset Safe!
            </p>
            
            ${giftSub.gift_message ? `
              <div style="background: white; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="color: #374151; margin: 0; font-style: italic;">"${giftSub.gift_message}"</p>
              </div>
            ` : ''}
            
            <div style="background: white; border-radius: 6px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #1f2937; margin-top: 0;">Your Gift Code:</h3>
              <div style="background: #1f2937; color: white; padding: 15px; border-radius: 4px; font-family: monospace; font-size: 18px; text-align: center; letter-spacing: 2px;">
                ${giftSub.gift_code}
              </div>
            </div>
          </div>
          
            <div style="margin-bottom: 30px;">
            <h3 style="color: #1f2937;">How to redeem your gift:</h3>
            <ol style="color: #374151; line-height: 1.6;">
              <li>Click the button below or visit <a href="https://www.assetsafe.net/login?giftCode=${giftSub.gift_code}" style="color: #2563eb;">www.assetsafe.net/login</a></li>
              <li>Create an account or sign in to your existing account</li>
              <li>Your gift code <strong>${giftSub.gift_code}</strong> will be automatically applied</li>
              <li>Start documenting and protecting your valuable assets!</li>
            </ol>
          </div>
          
          <div style="background: #ecfccb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <h3 style="color: #365314; margin-top: 0;">Your ${giftSub.plan_type.charAt(0).toUpperCase() + giftSub.plan_type.slice(1)} Plan includes:</h3>
            <ul style="color: #374151; margin: 0;">
              ${giftSub.plan_type === 'basic' ? `
                <li>1 property</li>
                <li>50GB secure cloud storage</li>
                <li>Photo uploads</li>
                <li>Web platform access</li>
                <li>Email support</li>
              ` : giftSub.plan_type === 'standard' ? `
                <li>Up to 3 properties</li>
                <li>200GB secure cloud storage</li>
                <li>Photo and video uploads</li>
                <li>AI-powered item identification & valuation</li>
                <li>Floor plan scanning</li>
                <li>Priority email support</li>
              ` : `
                <li>Up to 10 properties</li>
                <li>750GB secure cloud storage</li>
                <li>Unlimited photo and video uploads</li>
                <li>AI-powered item identification & valuation</li>
                <li>Floor plan scanning</li>
                <li>Priority email and phone support</li>
              `}
              <li><strong>12 months of full access</strong></li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 40px;">
            <a href="https://www.assetsafe.net/login?giftCode=${giftSub.gift_code}" style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Redeem Your Gift Now
            </a>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              Questions? Contact us at <a href="mailto:support@assetsafe.net" style="color: #2563eb;">support@assetsafe.net</a>
            </p>
            <p style="color: #6b7280; font-size: 12px; margin-top: 10px;">
              This gift subscription is valid for 12 months from activation and cannot be transferred or refunded.
            </p>
          </div>
        </div>
      `,
    });

    logStep("Recipient email sent", { messageId: recipientEmailResponse.data?.id });

    // Send confirmation email to purchaser
    const purchaserEmailResponse = await resend.emails.send({
      from: "Asset Safe <noreply@assetsafe.net>",
      to: [giftSub.purchaser_email],
      subject: `Gift Subscription Confirmation - ${giftSub.recipient_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <img src="https://www.assetsafe.net/lovable-uploads/asset-safe-logo-email.jpg" alt="Asset Safe" style="max-width: 200px; margin-bottom: 20px;" />
            <h1 style="color: #2563eb; margin-bottom: 10px;">🎁 Gift Sent Successfully!</h1>
            <h2 style="color: #1f2937; margin: 0;">Your Asset Safe gift subscription has been delivered</h2>
          </div>
          
          <div style="background: #f8fafc; border-radius: 8px; padding: 30px; margin-bottom: 30px;">
            <p style="font-size: 18px; color: #374151; margin-bottom: 20px;">
              Your gift of a <strong>${giftSub.plan_type.charAt(0).toUpperCase() + giftSub.plan_type.slice(1)} Plan</strong> subscription has been sent to <strong>${giftSub.recipient_name}</strong> (${giftSub.recipient_email}).
            </p>
            
            <div style="background: white; border-radius: 6px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #1f2937; margin-top: 0;">Gift Details:</h3>
              <ul style="color: #374151; margin: 0;">
                <li><strong>Recipient:</strong> ${giftSub.recipient_name}</li>
                <li><strong>Plan:</strong> ${giftSub.plan_type.charAt(0).toUpperCase() + giftSub.plan_type.slice(1)} Plan</li>
                <li><strong>Gift Code:</strong> ${giftSub.gift_code}</li>
                <li><strong>Duration:</strong> 12 months</li>
                <li><strong>Delivery Date:</strong> ${new Date(giftSub.delivery_date).toLocaleDateString()}</li>
              </ul>
              ${giftSub.gift_message ? `
                <div style="margin-top: 15px;">
                  <strong>Your Message:</strong>
                  <p style="margin: 5px 0 0 0; font-style: italic;">"${giftSub.gift_message}"</p>
                </div>
              ` : ''}
            </div>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h3 style="color: #1f2937;">What happens next?</h3>
            <ul style="color: #374151; line-height: 1.6;">
              <li>Your recipient has received an email with their gift code and redemption instructions</li>
              <li>They can create an account at www.assetsafe.net and enter the gift code to activate their subscription</li>
              <li>Once activated, they'll have full access to all ${giftSub.plan_type} plan features for 12 months</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              Thank you for giving the gift of Asset Safe! Questions? Contact us at <a href="mailto:support@assetsafe.net" style="color: #2563eb;">support@assetsafe.net</a>
            </p>
          </div>
        </div>
      `,
    });

    logStep("Purchaser confirmation email sent", { messageId: purchaserEmailResponse.data?.id });

    // Update gift subscription status
    const { error: updateError } = await supabaseClient
      .from('gift_subscriptions')
      .update({ 
        status: 'delivered',
        delivered_at: new Date().toISOString()
      })
      .eq('gift_code', giftCode);

    if (updateError) {
      logStep("Failed to update gift status", updateError);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      recipientEmailId: recipientEmailResponse.data?.id,
      purchaserEmailId: purchaserEmailResponse.data?.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in send-gift-email", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);