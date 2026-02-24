import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SYNC-SUBSCRIPTION] ${step}${detailsStr}`);
};

// Parse subscription items by lookup_key (same logic as webhook)
function parseSubscriptionItems(items: Stripe.SubscriptionItem[]) {
  let plan = 'free';
  let planLookupKey: string | null = null;
  let planPriceId: string | null = null;
  let baseStorageGb = 0;
  let storageAddonBlocksQty = 0;

  for (const item of items) {
    const lookupKey = item.price?.lookup_key;
    if (!lookupKey) continue;

    if (lookupKey.startsWith('standard_') || lookupKey.startsWith('premium_')) {
      planLookupKey = lookupKey;
      planPriceId = item.price.id;
      plan = lookupKey.startsWith('premium_') ? 'premium' : 'standard';
      baseStorageGb = plan === 'premium' ? 100 : 25;
    } else if (lookupKey === 'storage_25gb_monthly') {
      storageAddonBlocksQty = item.quantity || 0;
    }
  }

  return { plan, planLookupKey, planPriceId, baseStorageGb, storageAddonBlocksQty };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing required environment variables");
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Find Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      logStep("No Stripe customer found - creating inactive entitlement");
      await supabaseClient.from('entitlements').upsert({
        user_id: user.id, plan: 'free', status: 'inactive',
        base_storage_gb: 0, storage_addon_blocks_qty: 0,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
      
      return new Response(JSON.stringify({ synced: true, status: 'inactive' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const customerId = customers.data[0].id;

    // Get subscriptions - prioritize active ones
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId, status: 'all', limit: 10,
      expand: ['data.items.data.price']
    });

    const priorityOrder = ['active', 'trialing', 'past_due', 'incomplete'];
    let subscription: Stripe.Subscription | null = null;
    for (const status of priorityOrder) {
      const found = subscriptions.data.find(s => s.status === status);
      if (found) { subscription = found; break; }
    }
    if (!subscription && subscriptions.data.length > 0) {
      subscription = subscriptions.data[0];
    }

    if (!subscription) {
      logStep("No subscriptions found - setting inactive");
      await supabaseClient.from('entitlements').upsert({
        user_id: user.id, plan: 'free', status: 'inactive',
        stripe_customer_id: customerId,
        base_storage_gb: 0, storage_addon_blocks_qty: 0,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
      
      return new Response(JSON.stringify({ synced: true, status: 'inactive' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse subscription items by lookup_key
    const parsed = parseSubscriptionItems(subscription.items.data as Stripe.SubscriptionItem[]);
    logStep("Parsed subscription", { ...parsed, subscriptionId: subscription.id, status: subscription.status });

    let entitlementStatus = 'inactive';
    if (subscription.status === 'active' || subscription.status === 'trialing') {
      entitlementStatus = 'active';
    } else if (subscription.status === 'past_due') {
      entitlementStatus = 'past_due';
    } else if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
      entitlementStatus = 'canceled';
    }

    const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
    const totalStorageGb = parsed.baseStorageGb + (parsed.storageAddonBlocksQty * 25);

    // PRIMARY: Update entitlements
    await supabaseClient.from('entitlements').upsert({
      user_id: user.id,
      plan: parsed.plan,
      status: entitlementStatus,
      entitlement_source: 'stripe',
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      stripe_plan_price_id: parsed.planPriceId,
      plan_lookup_key: parsed.planLookupKey,
      subscription_status: subscription.status,
      cancel_at_period_end: subscription.cancel_at_period_end || false,
      base_storage_gb: parsed.baseStorageGb,
      storage_addon_blocks_qty: parsed.storageAddonBlocksQty,
      current_period_end: currentPeriodEnd,
      source_event_id: `sync_${Date.now()}`,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });

    // BACKWARDS COMPAT: Update profile
    await supabaseClient.from('profiles').update({
      stripe_customer_id: customerId,
      plan_id: parsed.plan,
      plan_status: entitlementStatus,
      property_limit: 999999,
      storage_quota_gb: totalStorageGb,
      current_period_end: currentPeriodEnd,
      updated_at: new Date().toISOString()
    }).eq('user_id', user.id);

    // BACKWARDS COMPAT: Update subscribers
    await supabaseClient.from('subscribers').upsert({
      user_id: user.id,
      email: user.email,
      stripe_customer_id: customerId,
      subscribed: entitlementStatus === 'active',
      subscription_tier: parsed.plan,
      subscription_end: currentPeriodEnd,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });

    logStep("Subscription synced successfully", { plan: parsed.plan, status: entitlementStatus, totalStorageGb });

    return new Response(JSON.stringify({ 
      synced: true,
      plan: parsed.plan,
      status: entitlementStatus,
      storage_quota_gb: totalStorageGb,
      base_storage_gb: parsed.baseStorageGb,
      storage_addon_blocks_qty: parsed.storageAddonBlocksQty,
      current_period_end: currentPeriodEnd,
      cancel_at_period_end: subscription.cancel_at_period_end,
      subscription_id: subscription.id,
      customer_id: customerId
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ synced: false, error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
