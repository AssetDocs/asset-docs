import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

// Map legacy planType + billingInterval to lookup key
function toLookupKey(planType: string, billingInterval: string): string {
  const plan = planType.toLowerCase();
  const interval = billingInterval === 'year' ? 'yearly' : 'monthly';
  if (plan === 'premium' || plan === 'professional') return `premium_${interval}`;
  return `standard_${interval}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const body = await req.json();
    const { planLookupKey, planType, billingInterval = 'month', email: providedEmail } = body;
    
    // Determine the lookup key - prefer explicit planLookupKey, fall back to legacy mapping
    const lookupKey = planLookupKey || toLookupKey(planType || 'standard', billingInterval);
    logStep("Resolved lookup key", { lookupKey, planLookupKey, planType, billingInterval });

    // Authenticate user (optional for pre-signup flow)
    let user = null;
    let userEmail = null;
    
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
        if (!userError && userData.user) {
          user = userData.user;
          userEmail = user.email;
          logStep("Authenticated user found", { userId: user.id, email: userEmail });
        }
      } catch (_error) {
        logStep("No valid authentication found");
      }
    }

    if (!userEmail && providedEmail) {
      userEmail = providedEmail;
    }

    if (!userEmail) {
      throw new Error("Email is required - either through authentication or in request body");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Look up the Stripe Price by lookup_key - MUST be active
    const prices = await stripe.prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 });
    if (prices.data.length === 0) {
      throw new Error(`No active Stripe price found for lookup_key: ${lookupKey}`);
    }
    const price = prices.data[0];
    logStep("Found Stripe price", { priceId: price.id, lookupKey });

    // Find or reference existing customer
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    }

    const origin = req.headers.get("origin") || "https://www.getassetsafe.com";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      line_items: [{ price: price.id, quantity: 1 }],
      mode: "subscription",
      success_url: `${origin}/subscription-success?session_id={CHECKOUT_SESSION_ID}&plan=${lookupKey}`,
      cancel_url: `${origin}/pricing`,
      payment_method_collection: 'always',
      automatic_tax: { enabled: true },
      tax_id_collection: { enabled: true },
      billing_address_collection: 'required',
      shipping_address_collection: { allowed_countries: ['US'] },
      customer_update: customerId ? { name: 'auto', address: 'auto', shipping: 'auto' } : undefined,
      metadata: {
        plan_lookup_key: lookupKey,
        user_id: user?.id || ''
      }
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorId = crypto.randomUUID();
    logStep("ERROR in create-checkout", { errorId, message: errorMessage });
    return new Response(JSON.stringify({ 
      error: "Payment processing failed. Please try again.",
      errorId 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
