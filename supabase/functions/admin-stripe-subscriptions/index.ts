import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[ADMIN-STRIPE-SUBSCRIPTIONS] ${step}`, details ? JSON.stringify(details) : '');
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

    logStep("Admin verified", { userId: user.id });

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    // Fetch all users ONCE upfront (not inside the loop)
    logStep("Fetching all users from auth");
    const { data: authData, error: usersError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    
    if (usersError) {
      logStep("Error fetching users", { error: usersError.message });
    }
    
    // Create a map of email -> user for O(1) lookup
    const usersByEmail = new Map<string, any>();
    if (authData?.users) {
      for (const u of authData.users) {
        if (u.email) {
          usersByEmail.set(u.email.toLowerCase(), u);
        }
      }
    }
    logStep(`Loaded ${usersByEmail.size} users for lookup`);

    // Fetch all profiles upfront for O(1) lookup
    const { data: allProfiles } = await supabase
      .from("profiles")
      .select("*");
    
    const profilesByUserId = new Map<string, any>();
    if (allProfiles) {
      for (const p of allProfiles) {
        profilesByUserId.set(p.user_id, p);
      }
    }
    logStep(`Loaded ${profilesByUserId.size} profiles for lookup`);

    // Fetch all active subscriptions from Stripe
    logStep("Fetching subscriptions from Stripe");
    
    const subscriptions = await stripe.subscriptions.list({
      status: "all",
      limit: 100,
      expand: ["data.customer", "data.items.data.price.product"],
    });

    logStep(`Found ${subscriptions.data.length} subscriptions`);

    // Process each subscription using pre-fetched data (no more N+1 queries)
    const subscriptionDetails = subscriptions.data.map((sub) => {
      const customer = sub.customer as Stripe.Customer;
      const priceItem = sub.items.data[0];
      const product = priceItem?.price?.product as Stripe.Product;

      // Check if this customer email exists in our users (O(1) lookup)
      let linkedUserId = null;
      let linkedProfile = null;

      if (customer?.email) {
        const matchingUser = usersByEmail.get(customer.email.toLowerCase());
        
        if (matchingUser) {
          linkedUserId = matchingUser.id;
          linkedProfile = profilesByUserId.get(matchingUser.id) || null;
        }
      }

      return {
        subscriptionId: sub.id,
        status: sub.status,
        currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
        currentPeriodStart: new Date(sub.current_period_start * 1000).toISOString(),
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        created: new Date(sub.created * 1000).toISOString(),
        customer: {
          id: customer?.id || null,
          email: customer?.email || null,
          name: customer?.name || null,
        },
        plan: {
          priceId: priceItem?.price?.id || null,
          productId: product?.id || null,
          productName: product?.name || null,
          amount: priceItem?.price?.unit_amount || null,
          currency: priceItem?.price?.currency || null,
          interval: priceItem?.price?.recurring?.interval || null,
        },
        linkedUserId,
        linkedProfile: linkedProfile ? {
          firstName: linkedProfile.first_name,
          lastName: linkedProfile.last_name,
          planStatus: linkedProfile.plan_status,
          stripeCustomerId: linkedProfile.stripe_customer_id,
        } : null,
        syncStatus: linkedProfile?.stripe_customer_id === customer?.id 
          ? "synced" 
          : linkedUserId 
            ? "mismatch" 
            : "orphaned",
      };
    });

    // Also get all profiles with stripe_customer_id set
    const profilesWithStripe = allProfiles?.filter(p => p.stripe_customer_id) || [];

    logStep("Returning subscription data", { 
      subscriptionCount: subscriptionDetails.length,
      profilesWithStripe: profilesWithStripe.length
    });

    return new Response(
      JSON.stringify({
        subscriptions: subscriptionDetails,
        profilesWithStripeId: profilesWithStripe.map(p => ({
          user_id: p.user_id,
          first_name: p.first_name,
          last_name: p.last_name,
          stripe_customer_id: p.stripe_customer_id,
          plan_status: p.plan_status,
          plan_id: p.plan_id,
        })),
        summary: {
          total: subscriptionDetails.length,
          active: subscriptionDetails.filter(s => s.status === "active").length,
          synced: subscriptionDetails.filter(s => s.syncStatus === "synced").length,
          mismatched: subscriptionDetails.filter(s => s.syncStatus === "mismatch").length,
          orphaned: subscriptionDetails.filter(s => s.syncStatus === "orphaned").length,
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    logStep("Error", { error: error.message, stack: error.stack });
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
