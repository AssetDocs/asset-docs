import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (step: string, details?: unknown) =>
  console.log(`[ADD-STORAGE-25GB] ${step}`, details === undefined ? "" : JSON.stringify(details));

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    const supabaseAnon = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    const { data: userData, error: userErr } = await supabaseAnon.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (userErr || !userData?.user?.email) {
      return new Response(JSON.stringify({ error: "Invalid authentication" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    const user = userData.user;
    log("User authenticated", { userId: user.id });

    // Require active base entitlement with a known stripe_customer_id —
    // never search Stripe by email here.
    const { data: ent } = await supabaseAdmin
      .from("entitlements")
      .select("status, stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!ent || !["active", "trialing"].includes(ent.status)) {
      return new Response(
        JSON.stringify({ error: "Active Asset Safe plan required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
      );
    }
    if (!ent.stripe_customer_id) {
      return new Response(
        JSON.stringify({ error: "Billing profile not ready" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
      );
    }

    // Use a stable lookup_key-backed price if present; fall back to ad-hoc price_data.
    const prices = await stripe.prices.list({
      lookup_keys: ["storage_25gb_monthly"],
      active: true,
      limit: 1,
    });

    const origin = req.headers.get("origin") || "https://www.assetsafe.net";
    const lineItem: Stripe.Checkout.SessionCreateParams.LineItem =
      prices.data.length > 0
        ? { price: prices.data[0].id, quantity: 1 }
        : {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Storage Add-on - 25GB",
                description: "Additional 25GB of secure cloud storage",
              },
              unit_amount: 499,
              recurring: { interval: "month" },
            },
            quantity: 1,
          };

    const session = await stripe.checkout.sessions.create({
      customer: ent.stripe_customer_id,
      line_items: [lineItem],
      mode: "subscription",
      billing_address_collection: "required",
      success_url: `${origin}/subscription-success?session_id={CHECKOUT_SESSION_ID}&plan=storage_25gb_monthly`,
      cancel_url: `${origin}/account-settings?tab=subscription`,
      metadata: {
        user_id: user.id,
        type: "storage_addon",
        plan_lookup_key: "storage_25gb_monthly",
        storage_amount_gb: "25",
      },
      subscription_data: {
        metadata: {
          type: "storage_addon",
          storage_amount_gb: "25",
        },
      },
    });

    log("Storage add-on session created", { sessionId: session.id });
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorId = crypto.randomUUID();
    log("ERROR", { errorId, message: (error as Error).message });
    return new Response(
      JSON.stringify({ error: "Storage add-on failed. Please try again.", errorId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
