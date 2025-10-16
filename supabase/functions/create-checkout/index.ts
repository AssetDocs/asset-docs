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
    logStep("Stripe key verified");

    // Parse request body to get plan type and optional email
    const { planType, email: providedEmail } = await req.json();
    if (!planType) throw new Error("Plan type is required");
    logStep("Request body parsed", { planType, providedEmail });

    // Attempt to retrieve authenticated user (optional)
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
      } catch (error) {
        logStep("No valid authentication found");
      }
    }

    // Use provided email if no authenticated user
    if (!userEmail && providedEmail) {
      userEmail = providedEmail;
      logStep("Using provided email", { email: userEmail });
    }

    if (!userEmail) {
      throw new Error("Email is required - either through authentication or in request body");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    } else {
      logStep("Creating new customer");
    }

    // Define pricing based on plan type
    let priceData;
    switch (planType) {
      case 'basic':
        priceData = {
          currency: "usd",
          product_data: { name: "Basic Plan" },
          unit_amount: 899, // $8.99
          recurring: { interval: "month" },
        };
        break;
      case 'standard':
        priceData = {
          currency: "usd",
          product_data: { name: "Standard Plan" },
          unit_amount: 1299, // $12.99
          recurring: { interval: "month" },
        };
        break;
      case 'premium':
        priceData = {
          currency: "usd",
          product_data: { name: "Premium Plan" },
          unit_amount: 1899, // $18.99
          recurring: { interval: "month" },
        };
        break;
      default:
        throw new Error("Invalid plan type");
    }

    logStep("Creating checkout session", { priceData });

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      line_items: [
        {
          price_data: priceData,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/subscription-success`,
      cancel_url: `${req.headers.get("origin")}/account-settings?tab=subscription`,
      // 30-day free trial before first payment
      subscription_data: {
        trial_period_days: 30,
      },
      // Enable automatic tax collection
      automatic_tax: {
        enabled: true,
      },
      // Collect customer's tax ID if needed for compliance
      tax_id_collection: {
        enabled: true,
      },
      // Enable customer details collection for tax calculation
      billing_address_collection: 'required',
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