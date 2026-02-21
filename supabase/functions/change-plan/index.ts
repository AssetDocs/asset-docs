import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PLAN_PRICES: Record<string, Record<string, { amount: number; product_name: string; storage_gb: number }>> = {
  standard: {
    month: { amount: 1299, product_name: "Asset Safe Standard (Monthly)", storage_gb: 25 },
    year: { amount: 12900, product_name: "Asset Safe Standard (Yearly)", storage_gb: 25 },
  },
  premium: {
    month: { amount: 1899, product_name: "Asset Safe Premium (Monthly)", storage_gb: 100 },
    year: { amount: 18900, product_name: "Asset Safe Premium (Yearly)", storage_gb: 100 },
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;
    const userEmail = claimsData.claims.email;

    const { targetPlan } = await req.json();
    if (!targetPlan || !["standard", "premium"].includes(targetPlan)) {
      return new Response(JSON.stringify({ error: "Invalid target plan" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2023-10-16",
    });

    // Find the Stripe customer
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
    if (!customers.data.length) {
      return new Response(JSON.stringify({ error: "No Stripe customer found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const customer = customers.data[0];

    // Get active subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: "active",
      limit: 1,
    });
    if (!subscriptions.data.length) {
      return new Response(JSON.stringify({ error: "No active subscription found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const subscription = subscriptions.data[0];

    // Find the main subscription item (not storage add-ons)
    // Storage add-ons have "storage" in their product name or are $4.99/$9.99
    const mainItem = subscription.items.data.find((item) => {
      const unitAmount = item.price?.unit_amount || 0;
      // Main plan items are $12.99, $18.99 monthly or $129, $189 yearly
      return [1299, 1899, 12900, 18900].includes(unitAmount);
    }) || subscription.items.data[0];

    // Determine current billing interval
    const currentInterval = mainItem.price?.recurring?.interval || "month";

    // Get the target price config
    const priceConfig = PLAN_PRICES[targetPlan][currentInterval];

    // Update the subscription with new price_data
    const updatedSubscription = await stripe.subscriptions.update(subscription.id, {
      items: [
        {
          id: mainItem.id,
          price_data: {
            currency: "usd",
            product: mainItem.price?.product as string,
            unit_amount: priceConfig.amount,
            recurring: { interval: currentInterval as "month" | "year" },
          },
        },
      ],
      proration_behavior: "create_prorations",
    });

    // Update entitlements immediately
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await serviceClient
      .from("entitlements")
      .update({
        plan: targetPlan,
        status: "active",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    // Also update profiles storage_quota_gb
    await serviceClient
      .from("profiles")
      .update({
        storage_quota_gb: priceConfig.storage_gb,
        subscription_tier: targetPlan,
      })
      .eq("user_id", userId);

    // Update subscribers table too
    await serviceClient
      .from("subscribers")
      .update({
        subscription_tier: targetPlan,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    return new Response(
      JSON.stringify({
        success: true,
        plan: targetPlan,
        interval: currentInterval,
        amount: priceConfig.amount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Change plan error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
