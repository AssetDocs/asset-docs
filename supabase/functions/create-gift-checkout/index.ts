import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-GIFT-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const body = await req.json();
    const { recipientEmail, fromName, giftMessage, purchaserEmail, recipientName } = body;

    if (!recipientEmail || !fromName || !purchaserEmail) {
      throw new Error("recipientEmail, fromName, and purchaserEmail are required");
    }

    // Validate email formats
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail) || !emailRegex.test(purchaserEmail)) {
      throw new Error("Invalid email address");
    }

    if (fromName.length > 100 || (giftMessage && giftMessage.length > 1000)) {
      throw new Error("Input exceeds maximum length");
    }

    // Verify consent exists for this purchaser (logged in last 30 minutes)
    const { data: consentData } = await supabase
      .from("user_consents")
      .select("id")
      .eq("user_email", purchaserEmail.toLowerCase().trim())
      .eq("consent_type", "gift_checkout")
      .gte("created_at", new Date(Date.now() - 30 * 60 * 1000).toISOString())
      .limit(1);

    if (!consentData || consentData.length === 0) {
      return new Response(JSON.stringify({
        error: "You must agree to the Terms and Subscription Agreement before continuing."
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    logStep("Consent verified");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Look up the gift price — no fallback: must be configured explicitly
    const prices = await stripe.prices.list({ lookup_keys: ["asset_safe_gift_annual"], active: true, limit: 1 });
    if (!prices.data.length) {
      throw new Error("Gift price 'asset_safe_gift_annual' not found in Stripe. Please configure this price key before processing gift purchases.");
    }
    const priceId = prices.data[0].id;
    logStep("Price found", { priceId, lookupKey: prices.data[0].lookup_key });

    // Check for existing Stripe customer
    const customers = await stripe.customers.list({ email: purchaserEmail, limit: 1 });
    let customerId = customers.data.length > 0 ? customers.data[0].id : undefined;

    const origin = req.headers.get("origin") || "https://www.getassetsafe.com";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : purchaserEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${origin}/gift-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/gift-checkout`,
      metadata: {
        gift: "true",
        gift_term: "yearly",
        recipient_email: recipientEmail,
        recipient_name: recipientName || "",
        from_name: fromName,
        gift_message: giftMessage || "",
        purchaser_email: purchaserEmail,
      },
      billing_address_collection: "required",
      automatic_tax: { enabled: true },
      customer_creation: customerId ? undefined : "always",
      customer_update: customerId ? { name: "auto", address: "auto" } : undefined,
      subscription_data: {
        metadata: {
          gift: "true",
          recipient_email: recipientEmail,
          recipient_name: recipientName || "",
          from_name: fromName,
        },
        cancel_at_period_end: true,
      }
    });

    logStep("Checkout session created", { sessionId: session.id });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorId = crypto.randomUUID();
    logStep("ERROR", { errorId, message: errorMessage });

    return new Response(JSON.stringify({
      error: "Gift checkout failed. Please try again.",
      errorId
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
