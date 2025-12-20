import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CANCEL-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Parse request body for action (cancel or reactivate)
    const { action } = await req.json();
    logStep("Action requested", { action });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Get customer by email
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      throw new Error("No Stripe customer found for this user");
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1
    });

    // Also check for subscriptions that are scheduled to cancel
    const cancelingSubscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 10
    });

    const activeOrCancelingSub = cancelingSubscriptions.data.find(
      sub => sub.status === 'active' || (sub.status === 'active' && sub.cancel_at_period_end)
    );

    if (!activeOrCancelingSub && action === 'cancel') {
      throw new Error("No active subscription found to cancel");
    }

    if (action === 'cancel') {
      // Cancel at period end (user keeps access until billing cycle ends)
      const subscription = subscriptions.data[0] || activeOrCancelingSub;
      
      if (!subscription) {
        throw new Error("No subscription found to cancel");
      }

      const updatedSubscription = await stripe.subscriptions.update(subscription.id, {
        cancel_at_period_end: true
      });

      logStep("Subscription set to cancel at period end", { 
        subscriptionId: subscription.id,
        cancelAt: updatedSubscription.cancel_at 
      });

      // Update profile to reflect pending cancellation
      await supabaseClient
        .from('profiles')
        .update({
          plan_status: 'canceling',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      return new Response(JSON.stringify({ 
        success: true, 
        message: "Subscription will be canceled at the end of the billing period",
        cancel_at: updatedSubscription.cancel_at,
        current_period_end: updatedSubscription.current_period_end
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });

    } else if (action === 'reactivate') {
      // Find the subscription that's set to cancel
      const subscriptionToReactivate = cancelingSubscriptions.data.find(
        sub => sub.cancel_at_period_end === true
      );

      if (!subscriptionToReactivate) {
        throw new Error("No subscription found that is scheduled for cancellation");
      }

      // Reactivate by removing cancel_at_period_end
      const updatedSubscription = await stripe.subscriptions.update(subscriptionToReactivate.id, {
        cancel_at_period_end: false
      });

      logStep("Subscription reactivated", { subscriptionId: subscriptionToReactivate.id });

      // Update profile back to active
      await supabaseClient
        .from('profiles')
        .update({
          plan_status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      return new Response(JSON.stringify({ 
        success: true, 
        message: "Subscription has been reactivated",
        status: updatedSubscription.status
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });

    } else {
      throw new Error("Invalid action. Use 'cancel' or 'reactivate'");
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in cancel-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
