import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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
      logStep("No Stripe customer found");
      return new Response(JSON.stringify({ 
        synced: false, 
        message: "No Stripe customer found for this email" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      logStep("No subscriptions found");
      return new Response(JSON.stringify({ 
        synced: false, 
        message: "No subscriptions found for this customer" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const subscription = subscriptions.data[0];
    logStep("Found subscription", { 
      subscriptionId: subscription.id, 
      status: subscription.status,
      productId: subscription.items.data[0]?.price?.product
    });

    // Determine plan details from subscription
    const productId = subscription.items.data[0]?.price?.product as string;
    let planId = 'standard';
    let propertyLimit = 3;
    let storageQuotaGb = 20;

    // Try to get product name to determine plan
    try {
      const product = await stripe.products.retrieve(productId);
      const productName = product.name.toLowerCase();
      logStep("Product retrieved", { productName });
      
      if (productName.includes('premium') || productName.includes('professional')) {
        planId = 'premium';
        propertyLimit = 10;
        storageQuotaGb = 50;
      }
    } catch (e) {
      logStep("Could not retrieve product, defaulting to standard");
    }

    // Map Stripe status to our status
    let planStatus = 'inactive';
    if (subscription.status === 'active' || subscription.status === 'trialing') {
      planStatus = 'active';
    } else if (subscription.status === 'past_due') {
      planStatus = 'past_due';
    } else if (subscription.status === 'canceled') {
      planStatus = 'canceled';
    }

    const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();

    // Update profile
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        stripe_customer_id: customerId,
        plan_id: planId,
        plan_status: planStatus,
        property_limit: propertyLimit,
        storage_quota_gb: storageQuotaGb,
        current_period_end: currentPeriodEnd,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (updateError) {
      logStep("Error updating profile", updateError);
      throw new Error("Failed to update profile");
    }

    // Also update/create subscribers record
    const { error: subscribersError } = await supabaseClient
      .from('subscribers')
      .upsert({
        user_id: user.id,
        email: user.email,
        stripe_customer_id: customerId,
        subscribed: planStatus === 'active',
        subscription_tier: planId,
        subscription_end: currentPeriodEnd,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (subscribersError) {
      logStep("Error updating subscribers", subscribersError);
    }

    logStep("Subscription synced successfully", { planId, planStatus, propertyLimit, storageQuotaGb });

    return new Response(JSON.stringify({ 
      synced: true,
      plan_id: planId,
      plan_status: planStatus,
      property_limit: propertyLimit,
      storage_quota_gb: storageQuotaGb,
      current_period_end: currentPeriodEnd
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
