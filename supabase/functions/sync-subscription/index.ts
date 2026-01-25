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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started - Phase 3 race-condition fix");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing required environment variables");
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // Get authenticated user
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
      
      // Ensure user has a base entitlement record
      await supabaseClient
        .from('entitlements')
        .upsert({
          user_id: user.id,
          plan: 'free',
          status: 'inactive',
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      
      return new Response(JSON.stringify({ 
        synced: true, 
        status: 'inactive',
        message: "No Stripe customer found for this email" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Get subscriptions - prioritize active ones
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 10,
    });

    // Find the most relevant subscription
    const priorityOrder = ['active', 'trialing', 'past_due', 'incomplete'];
    let subscription: Stripe.Subscription | null = null;

    for (const status of priorityOrder) {
      const found = subscriptions.data.find(s => s.status === status);
      if (found) {
        subscription = found;
        break;
      }
    }

    // If no subscription in priority list, take the most recent
    if (!subscription && subscriptions.data.length > 0) {
      subscription = subscriptions.data[0];
    }

    if (!subscription) {
      logStep("No subscriptions found - setting inactive");
      
      // Ensure user has a base entitlement record
      await supabaseClient
        .from('entitlements')
        .upsert({
          user_id: user.id,
          plan: 'free',
          status: 'inactive',
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      
      return new Response(JSON.stringify({ 
        synced: true, 
        status: 'inactive',
        message: "No subscriptions found for this customer" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    logStep("Found subscription", { 
      subscriptionId: subscription.id, 
      status: subscription.status,
      productId: subscription.items.data[0]?.price?.product
    });

    // Determine plan details from subscription
    const productId = subscription.items.data[0]?.price?.product as string;
    const priceId = subscription.items.data[0]?.price?.id || '';
    let planId = 'standard';
    let propertyLimit = 3;
    let storageQuotaGb = 25;

    // Try to get product name to determine plan
    try {
      const product = await stripe.products.retrieve(productId);
      const productName = product.name.toLowerCase();
      logStep("Product retrieved", { productName });
      
      if (productName.includes('premium') || productName.includes('professional')) {
        planId = 'premium';
        propertyLimit = -1; // Unlimited
        storageQuotaGb = 100;
      }
    } catch (e) {
      // Fallback: check price ID
      const priceLower = priceId.toLowerCase();
      if (priceLower.includes('premium') || priceLower.includes('professional')) {
        planId = 'premium';
        propertyLimit = -1;
        storageQuotaGb = 100;
      }
      logStep("Could not retrieve product, checked price ID", { planId });
    }

    // Map Stripe status to entitlement status
    let entitlementStatus = 'inactive';
    if (subscription.status === 'active' || subscription.status === 'trialing') {
      entitlementStatus = 'active';
    } else if (subscription.status === 'past_due') {
      entitlementStatus = 'past_due';
    } else if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
      entitlementStatus = 'canceled';
    }

    const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();

    // PRIMARY: Update entitlements table (source of truth)
    const { error: entitlementError } = await supabaseClient
      .from('entitlements')
      .upsert({
        user_id: user.id,
        plan: planId,
        status: entitlementStatus,
        current_period_end: currentPeriodEnd,
        source_event_id: `sync_${Date.now()}`,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (entitlementError) {
      logStep("Error updating entitlements", entitlementError);
      throw new Error("Failed to update entitlements");
    }

    logStep("Entitlements updated", { plan: planId, status: entitlementStatus });

    // BACKWARDS COMPAT: Update profile
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        stripe_customer_id: customerId,
        plan_id: planId,
        plan_status: entitlementStatus,
        property_limit: propertyLimit,
        storage_quota_gb: storageQuotaGb,
        current_period_end: currentPeriodEnd,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (updateError) {
      logStep("Error updating profile", updateError);
      // Don't throw - entitlements is the source of truth
    }

    // BACKWARDS COMPAT: Update subscribers record
    const { error: subscribersError } = await supabaseClient
      .from('subscribers')
      .upsert({
        user_id: user.id,
        email: user.email,
        stripe_customer_id: customerId,
        subscribed: entitlementStatus === 'active',
        subscription_tier: planId,
        subscription_end: currentPeriodEnd,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (subscribersError) {
      logStep("Error updating subscribers", subscribersError);
      // Don't throw - entitlements is the source of truth
    }

    logStep("Subscription synced successfully", { 
      plan: planId, 
      status: entitlementStatus, 
      propertyLimit, 
      storageQuotaGb,
      subscriptionId: subscription.id
    });

    return new Response(JSON.stringify({ 
      synced: true,
      plan: planId,
      status: entitlementStatus,
      property_limit: propertyLimit,
      storage_quota_gb: storageQuotaGb,
      current_period_end: currentPeriodEnd,
      subscription_id: subscription.id,
      customer_id: customerId
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ 
      synced: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
