import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CREATE-GIFT-CHECKOUT] ${step}${detailsStr}`);
};

function base64url(bytes: Uint8Array): string {
  const s = btoa(String.fromCharCode(...bytes));
  return s.replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function genGiftCode(): string {
  const random = Array.from(crypto.getRandomValues(new Uint8Array(5)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
  return `GIFT-${random}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const body = await req.json();
    const { recipientEmail, fromName, giftMessage, purchaserEmail, recipientName } = body ?? {};

    if (!recipientEmail || !fromName || !purchaserEmail) {
      throw new Error("recipientEmail, fromName, and purchaserEmail are required");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail) || !emailRegex.test(purchaserEmail)) {
      throw new Error("Invalid email address");
    }
    if (fromName.length > 100 || (giftMessage && giftMessage.length > 1000)) {
      throw new Error("Input exceeds maximum length");
    }

    // Verify consent (logged in last 30 minutes)
    const { data: consentData } = await supabase
      .from("user_consents")
      .select("id")
      .eq("user_email", purchaserEmail.toLowerCase().trim())
      .eq("consent_type", "gift_checkout")
      .gte("created_at", new Date(Date.now() - 30 * 60 * 1000).toISOString())
      .limit(1);
    if (!consentData || consentData.length === 0) {
      return new Response(
        JSON.stringify({ error: "You must agree to the Terms and Subscription Agreement before continuing." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    const prices = await stripe.prices.list({ lookup_keys: ["asset_safe_gift_annual"], active: true, limit: 1 });
    if (!prices.data.length) throw new Error("Gift price 'asset_safe_gift_annual' not found in Stripe.");
    const priceId = prices.data[0].id;

    const customers = await stripe.customers.list({ email: purchaserEmail, limit: 1 });
    const customerId = customers.data.length > 0 ? customers.data[0].id : undefined;

    const origin = req.headers.get("origin") || "https://www.getassetsafe.com";

    // Generate gift row first
    const giftId = crypto.randomUUID();
    const giftCode = genGiftCode();
    const successToken = base64url(crypto.getRandomValues(new Uint8Array(32)));
    const successTokenHash = await sha256Hex(successToken);
    const successTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { error: insertError } = await supabase.from("gift_subscriptions").insert({
      id: giftId,
      gift_code: giftCode,
      plan_type: "standard",
      term: "yearly",
      purchaser_email: purchaserEmail,
      purchaser_name: fromName,
      recipient_email: recipientEmail,
      recipient_name: recipientName || "",
      gift_message: giftMessage || null,
      delivery_date: new Date().toISOString(),
      amount: 18900,
      currency: "usd",
      status: "pending",
      payment_status: "pending",
      delivery_status: "not_sent",
      redemption_status: "unredeemed",
      success_token_hash: successTokenHash,
      success_token_expires_at: successTokenExpiresAt,
    });
    if (insertError) {
      logStep("ERROR inserting gift row", insertError);
      throw new Error("Failed to initialize gift record");
    }

    // success_url built server-side WITH the success token
    const successUrl = `${origin}/gift-success?session_id={CHECKOUT_SESSION_ID}&t=${encodeURIComponent(successToken)}`;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : purchaserEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: `${origin}/gift-checkout`,
      metadata: {
        gift: "true",
        gift_term: "yearly",
        gift_subscription_id: giftId,
      },
      billing_address_collection: "required",
      automatic_tax: { enabled: true },
      customer_creation: customerId ? undefined : "always",
      customer_update: customerId ? { name: "auto", address: "auto" } : undefined,
      subscription_data: {
        metadata: {
          gift: "true",
          gift_subscription_id: giftId,
          gift_term: "yearly",
        },
        cancel_at_period_end: true,
      },
    });

    await supabase
      .from("gift_subscriptions")
      .update({ stripe_session_id: session.id, stripe_checkout_session_id: session.id })
      .eq("id", giftId);

    logStep("Checkout session created", { sessionId: session.id, giftId });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorId = crypto.randomUUID();
    logStep("ERROR", { errorId, message: errorMessage });
    return new Response(
      JSON.stringify({ error: "Gift checkout failed. Please try again.", errorId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
