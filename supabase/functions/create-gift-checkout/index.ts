import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-GIFT-CHECKOUT] ${step}${detailsStr}`);
};

// Generate a unique gift code
const generateGiftCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return `GIFT-${result}`;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Use service role key for database operations
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  // Get authenticated user if present (for purchaser_user_id)
  let purchaserUserId = null;
  const authHeader = req.headers.get('Authorization');
  if (authHeader) {
    const userSupabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    
    try {
      const { data: { user } } = await userSupabaseClient.auth.getUser(
        authHeader.replace('Bearer ', '')
      );
      purchaserUserId = user?.id || null;
      logStep("Authenticated purchaser found", { purchaserUserId });
    } catch (error) {
      logStep("No authenticated purchaser found", error);
    }
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    // Parse request body to get plan type and gift data
    const { planType, giftData } = await req.json();
    if (!planType || !giftData) throw new Error("Plan type and gift data are required");
    logStep("Request body parsed", { planType, giftData });

    const {
      purchaserEmail,
      purchaserName,
      purchaserPhone,
      recipientEmail,
      recipientName,
      giftMessage,
      deliveryDate
    } = giftData;

    if (!purchaserEmail || !recipientEmail) {
      throw new Error("Purchaser and recipient emails are required");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Check if purchaser exists as a Stripe customer
    const customers = await stripe.customers.list({ email: purchaserEmail, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    } else {
      logStep("Creating new customer for purchaser");
    }

    // Define pricing based on plan type (annual pricing for gifts)
    let priceData;
    let amount;
    switch (planType) {
      case 'basic':
        amount = 9889; // $98.89
        priceData = {
          currency: "usd",
          product_data: { name: "Basic Plan - 12 Month Gift Subscription" },
          unit_amount: amount,
        };
        break;
      case 'standard':
        amount = 14289; // $142.89
        priceData = {
          currency: "usd",
          product_data: { name: "Standard Plan - 12 Month Gift Subscription" },
          unit_amount: amount,
        };
        break;
      case 'premium':
        amount = 20889; // $208.89
        priceData = {
          currency: "usd",
          product_data: { name: "Premium Plan - 12 Month Gift Subscription" },
          unit_amount: amount,
        };
        break;
      default:
        throw new Error("Invalid plan type");
    }

    // Generate gift code
    const giftCode = generateGiftCode();
    logStep("Generated gift code", { giftCode });

    logStep("Creating checkout session", { priceData });

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : purchaserEmail,
      line_items: [
        {
          price_data: priceData,
          quantity: 1,
        },
      ],
      mode: "payment", // One-time payment for gift
      success_url: `${req.headers.get("origin")}/gift-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/gift`,
      metadata: {
        gift_code: giftCode,
        plan_type: planType,
        purchaser_email: purchaserEmail,
        purchaser_name: purchaserName,
        purchaser_phone: purchaserPhone || '',
        recipient_email: recipientEmail,
        recipient_name: recipientName,
        gift_message: giftMessage || '',
        delivery_date: deliveryDate || new Date().toISOString(),
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
      customer_creation: customerId ? undefined : 'always',
    });

    // Store gift information in database for later processing
    const { error: insertError } = await supabaseClient
      .from('gift_subscriptions')
      .insert({
        gift_code: giftCode,
        stripe_session_id: session.id,
        plan_type: planType,
        purchaser_email: purchaserEmail,
        purchaser_name: purchaserName,
        purchaser_phone: purchaserPhone || null,
        purchaser_user_id: purchaserUserId, // Add purchaser user ID for security
        recipient_email: recipientEmail,
        recipient_name: recipientName,
        gift_message: giftMessage || null,
        delivery_date: deliveryDate || new Date().toISOString(),
        status: 'pending',
        amount: amount,
        currency: 'usd',
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      logStep("Database insert error", insertError);
      throw new Error(`Failed to store gift information: ${insertError.message}`);
    }

    logStep("Gift checkout session created", { sessionId: session.id, url: session.url, giftCode });

    return new Response(JSON.stringify({ url: session.url, giftCode }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-gift-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});