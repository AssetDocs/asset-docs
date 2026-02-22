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

    // Parse request body to get plan type, billing interval, and optional email
    const { planType, billingInterval = 'month', email: providedEmail } = await req.json();
    if (!planType) throw new Error("Plan type is required");
    logStep("Request body parsed", { planType, billingInterval, providedEmail });

    // Validate billing interval
    const validIntervals = ['month', 'year'];
    if (!validIntervals.includes(billingInterval)) {
      throw new Error("Invalid billing interval");
    }

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

    // Define pricing based on plan type and billing interval
    let priceData;
    const isYearly = billingInterval === 'year';
    
    switch (planType) {
      case 'standard':
        priceData = {
          currency: "usd",
          product_data: { 
            name: isYearly 
              ? "Standard Plan (Homeowner Plan) - Annual" 
              : "Standard Plan (Homeowner Plan)" 
          },
          unit_amount: isYearly ? 12900 : 1299, // $129/year or $12.99/month
          recurring: { interval: billingInterval as 'month' | 'year' },
        };
        break;
      case 'premium':
        priceData = {
          currency: "usd",
          product_data: { 
            name: isYearly 
              ? "Premium Plan (Professional Plan) - Annual" 
              : "Premium Plan (Professional Plan)" 
          },
          unit_amount: isYearly ? 18900 : 1899, // $189/year or $18.99/month
          recurring: { interval: billingInterval as 'month' | 'year' },
        };
        break;
      default:
        throw new Error("Invalid plan type");
    }

    logStep("Creating checkout session", { priceData, billingInterval });

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
      success_url: `${req.headers.get("origin")}/account?payment_success=true`,
      cancel_url: `${req.headers.get("origin")}/pricing`,
      // Immediate payment - no trial period
      payment_method_collection: 'always',
      // Enable automatic tax collection
      automatic_tax: {
        enabled: true,
      },
      // Collect customer's tax ID if needed for compliance
      tax_id_collection: {
        enabled: true,
      },
      // Collect billing address and restrict to US only
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
      // Update customer name automatically for existing customers
      customer_update: customerId ? {
        name: 'auto',
        address: 'auto'
      } : undefined,
      // Pass plan type and billing interval in metadata for webhook processing
      metadata: {
        plan_type: planType,
        billing_interval: billingInterval,
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
