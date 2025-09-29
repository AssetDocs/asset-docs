import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PAYMENT-HISTORY] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      logStep("No Stripe customer found");
      return new Response(JSON.stringify({ payments: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Get payment intents (completed payments)
    const paymentIntents = await stripe.paymentIntents.list({
      customer: customerId,
      limit: 50,
    });

    const payments = [];

    for (const payment of paymentIntents.data) {
      if (payment.status === 'succeeded') {
        let paymentMethodDetails = null;
        let subscriptionType = null;

        // Get payment method details
        if (payment.payment_method) {
          try {
            const pm = await stripe.paymentMethods.retrieve(payment.payment_method as string);
            if (pm.card) {
              paymentMethodDetails = {
                type: pm.card.brand.charAt(0).toUpperCase() + pm.card.brand.slice(1),
                last4: pm.card.last4
              };
            }
          } catch (error) {
            logStep("Error retrieving payment method", { error: error.message });
          }
        }

        // Try to determine subscription type from metadata or invoice
        if (payment.invoice) {
          try {
            const invoice = await stripe.invoices.retrieve(payment.invoice as string);
            if (invoice.subscription) {
              const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
              if (subscription.items.data.length > 0) {
                const price = await stripe.prices.retrieve(subscription.items.data[0].price.id);
                const productId = price.product as string;
                const product = await stripe.products.retrieve(productId);
                
                // Map product names to subscription types
                const productName = product.name.toLowerCase();
                if (productName.includes('premium')) {
                  subscriptionType = 'premium';
                } else if (productName.includes('standard')) {
                  subscriptionType = 'standard';
                } else if (productName.includes('basic')) {
                  subscriptionType = 'basic';
                }
              }
            }
          } catch (error) {
            logStep("Error retrieving subscription details", { error: error.message });
          }
        }

        payments.push({
          id: payment.id,
          amount: payment.amount / 100, // Convert from cents
          currency: payment.currency.toUpperCase(),
          created: payment.created * 1000, // Convert to milliseconds
          paymentMethod: paymentMethodDetails,
          subscriptionType: subscriptionType || 'unknown',
          status: payment.status
        });
      }
    }

    // Sort by date (newest first)
    payments.sort((a, b) => b.created - a.created);

    logStep("Payment history retrieved", { count: payments.length });

    return new Response(JSON.stringify({ payments }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in payment-history", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage, payments: [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});