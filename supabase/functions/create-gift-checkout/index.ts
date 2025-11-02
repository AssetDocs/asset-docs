import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-GIFT-CHECKOUT] ${step}${detailsStr}`);
};

// Validation schema for gift data
const giftDataSchema = z.object({
  purchaserEmail: z.string().email().max(255),
  purchaserName: z.string().trim().min(1).max(100),
  purchaserPhone: z.string().max(20).optional(),
  recipientEmail: z.string().email().max(255),
  recipientName: z.string().trim().min(1).max(100),
  deliveryDate: z.string(),
  giftMessage: z.string().max(1000).optional()
});

// Generate a cryptographically secure gift code
const generateGiftCode = () => {
  const randomBytes = new Uint8Array(16); // 128 bits
  crypto.getRandomValues(randomBytes);
  
  // Use base32 for better human readability (avoids 0/O, 1/I confusion)
  const base32Chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  
  for (let i = 0; i < 20; i++) {
    result += base32Chars[randomBytes[i % 16] % base32Chars.length];
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
    const body = await req.json();
    const { planType, giftData } = body;
    
    if (!planType || !giftData) {
      throw new Error("Plan type and gift data are required");
    }
    
    // Validate plan type
    const validPlanTypes = ['standard', 'premium'];
    if (!validPlanTypes.includes(planType)) {
      throw new Error("Invalid plan type");
    }
    
    // Validate gift data with zod
    const validatedGiftData = giftDataSchema.parse(giftData);
    logStep("Request body parsed and validated", { planType });

    const {
      purchaserEmail,
      purchaserName,
      purchaserPhone,
      recipientEmail,
      recipientName,
      deliveryDate,
      giftMessage
    } = validatedGiftData;

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
      case 'standard':
        amount = 15588; // $155.88
        priceData = {
          currency: "usd",
          product_data: { name: "Standard Plan - 12 Month Gift Subscription" },
          unit_amount: amount,
        };
        break;
      case 'premium':
        amount = 22788; // $227.88
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
        delivery_date: deliveryDate,
        gift_message: giftMessage || '',
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
      // Update customer name automatically for existing customers
      customer_update: customerId ? {
        name: 'auto',
        address: 'auto'
      } : undefined,
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
        delivery_date: new Date(deliveryDate).toISOString(),
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
    const errorId = crypto.randomUUID();
    logStep("ERROR in create-gift-checkout", { errorId, message: errorMessage });
    
    // Return user-friendly error message
    let userMessage = "Gift checkout failed. Please try again.";
    if (error instanceof z.ZodError) {
      userMessage = "Invalid input data. Please check your information.";
    } else if (errorMessage.includes("Plan type")) {
      userMessage = "Invalid subscription plan selected.";
    }
    
    return new Response(JSON.stringify({ 
      error: userMessage,
      errorId 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});