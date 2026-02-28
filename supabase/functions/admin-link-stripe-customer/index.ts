import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[ADMIN-LINK-STRIPE] ${step}`, details ? JSON.stringify(details) : '');
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing required environment variables");
    }

    // Verify admin access via JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user is admin
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, stripeCustomerId, userId, subscriptionId } = await req.json();
    logStep("Processing action", { action, stripeCustomerId, userId, subscriptionId });

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    if (action === "link") {
      // Link a Stripe customer to a user profile
      if (!stripeCustomerId || !userId) {
        throw new Error("Missing stripeCustomerId or userId");
      }

      // Get Stripe subscription details
      const subscriptions = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        status: "all",
        limit: 1,
      });

      const activeSub = subscriptions.data.find(s => 
        s.status === "active" || s.status === "trialing"
      ) || subscriptions.data[0];

      // Determine plan details from subscription
      let planId = null;
      let planStatus = "inactive";
      let propertyLimit = 1;
      let storageQuotaGb = 5;
      let currentPeriodEnd = null;

      if (activeSub) {
        const priceId = activeSub.items.data[0]?.price?.id;
        const amount = activeSub.items.data[0]?.price?.unit_amount || 0;
        
        // Determine plan tier based on amount
        if (amount >= 18900) {
          planId = "premium";
          propertyLimit = 10;
          storageQuotaGb = 50;
        } else if (amount >= 12900) {
          planId = "standard";
          propertyLimit = 5;
          storageQuotaGb = 25;
        }

        planStatus = activeSub.status === "active" || activeSub.status === "trialing" 
          ? "active" 
          : activeSub.cancel_at_period_end 
            ? "canceling" 
            : activeSub.status;

        currentPeriodEnd = new Date(activeSub.current_period_end * 1000).toISOString();
      }

      // Cross-validate: verify the Stripe customer email matches the target user's auth email
      const { data: targetUserData, error: targetUserError } = await supabase.auth.admin.getUserById(userId);
      if (targetUserError || !targetUserData?.user) {
        throw new Error(`Target user not found: ${userId}`);
      }
      const targetUserEmail = targetUserData.user.email?.toLowerCase();
      const stripeCustomerEmail = (customer as Stripe.Customer).email?.toLowerCase();
      if (targetUserEmail && stripeCustomerEmail && targetUserEmail !== stripeCustomerEmail) {
        logStep("Email mismatch — refusing to link", { targetUserEmail, stripeCustomerEmail });
        return new Response(
          JSON.stringify({
            error: `Cannot link: Stripe customer email (${stripeCustomerEmail}) does not match user email (${targetUserEmail})`,
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Update the user's profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          stripe_customer_id: stripeCustomerId,
          plan_id: planId,
          plan_status: planStatus,
          property_limit: propertyLimit,
          storage_quota_gb: storageQuotaGb,
          current_period_end: currentPeriodEnd,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (updateError) {
        throw new Error(`Failed to update profile: ${updateError.message}`);
      }

      // Also update/create subscriber record
      const customer = await stripe.customers.retrieve(stripeCustomerId) as Stripe.Customer;
      
      await supabase
        .from("subscribers")
        .upsert({
          user_id: userId,
          email: customer.email,
          subscribed: planStatus === "active",
          subscription_tier: planId,
          stripe_customer_id: stripeCustomerId,
          subscription_end: currentPeriodEnd,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });

      logStep("Successfully linked customer", { stripeCustomerId, userId, planId, planStatus });

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Customer linked successfully",
          linkedPlan: planId,
          linkedStatus: planStatus,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } else if (action === "cancel") {
      // Cancel a subscription in Stripe
      if (!subscriptionId) {
        throw new Error("Missing subscriptionId");
      }

      const canceledSub = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });

      logStep("Subscription set to cancel at period end", { 
        subscriptionId, 
        cancelAt: canceledSub.cancel_at 
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Subscription will cancel at period end",
          cancelAt: canceledSub.current_period_end,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } else if (action === "cancel_immediately") {
      // Cancel subscription immediately
      if (!subscriptionId) {
        throw new Error("Missing subscriptionId");
      }

      await stripe.subscriptions.cancel(subscriptionId);

      logStep("Subscription canceled immediately", { subscriptionId });

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Subscription canceled immediately",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } else {
      throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    logStep("Error", { error: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
