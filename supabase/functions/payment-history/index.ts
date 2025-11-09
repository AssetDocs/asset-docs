import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    if (!stripeKey) {
      logStep("STRIPE_SECRET_KEY not found");
      throw new Error("STRIPE_SECRET_KEY is not set");
    }

    // Get user from Supabase auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !serviceKey) {
      throw new Error("Missing Supabase configuration");
    }

    // Verify user with Supabase
    const token = authHeader.replace("Bearer ", "");
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': serviceKey,
      },
    });

    if (!userResponse.ok) {
      throw new Error("Authentication failed");
    }

    const user = await userResponse.json();
    if (!user?.email) {
      throw new Error("User not authenticated or email not available");
    }

    logStep("User authenticated", { userId: user.id, email: user.email });

    // Find Stripe customer
    const customerResponse = await fetch(`https://api.stripe.com/v1/customers?email=${encodeURIComponent(user.email)}&limit=1`, {
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!customerResponse.ok) {
      throw new Error("Failed to fetch Stripe customer");
    }

    const customerData = await customerResponse.json();
    
    if (!customerData.data || customerData.data.length === 0) {
      logStep("No Stripe customer found");
      return new Response(JSON.stringify({ payments: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customerData.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Get invoices (paid subscription charges)
    const invoicesResponse = await fetch(`https://api.stripe.com/v1/invoices?customer=${customerId}&status=paid&limit=20`, {
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!invoicesResponse.ok) {
      throw new Error("Failed to fetch invoices");
    }

    const invoicesData = await invoicesResponse.json();
    const payments = [];

    for (const invoice of invoicesData.data || []) {
      if (invoice.status === 'paid' && invoice.amount_paid > 0) {
        let paymentMethodInfo = null;
        let subscriptionType = 'subscription';

        // Try to get payment method info from charge
        if (invoice.charge) {
          try {
            const chargeResponse = await fetch(`https://api.stripe.com/v1/charges/${invoice.charge}`, {
              headers: {
                'Authorization': `Bearer ${stripeKey}`,
              },
            });
            
            if (chargeResponse.ok) {
              const charge = await chargeResponse.json();
              if (charge.payment_method_details?.card) {
                const card = charge.payment_method_details.card;
                paymentMethodInfo = {
                  type: card.brand?.charAt(0).toUpperCase() + card.brand?.slice(1) || 'Card',
                  last4: card.last4 || '****'
                };
              }
            }
          } catch (error) {
            logStep("Error fetching charge details", { error: error instanceof Error ? error.message : String(error) });
          }
        }

        // Determine subscription type from lines
        if (invoice.lines?.data?.[0]?.price?.nickname) {
          const nickname = invoice.lines.data[0].price.nickname.toLowerCase();
          if (nickname.includes('premium')) subscriptionType = 'premium';
          else if (nickname.includes('standard')) subscriptionType = 'standard';
          else if (nickname.includes('basic')) subscriptionType = 'basic';
        }

        payments.push({
          id: invoice.id,
          amount: invoice.amount_paid / 100, // Convert from cents
          currency: (invoice.currency || 'usd').toUpperCase(),
          created: invoice.created * 1000, // Convert to milliseconds
          paymentMethod: paymentMethodInfo,
          subscriptionType: subscriptionType,
          status: 'succeeded'
        });
      }
    }

    // Get customer's payment methods with full details
    const paymentMethods = [];
    try {
      const paymentMethodsResponse = await fetch(`https://api.stripe.com/v1/payment_methods?customer=${customerId}&type=card&limit=10`, {
        headers: {
          'Authorization': `Bearer ${stripeKey}`,
        },
      });

      if (paymentMethodsResponse.ok) {
        const paymentMethodsData = await paymentMethodsResponse.json();
        for (const pm of paymentMethodsData.data || []) {
          if (pm.card) {
            paymentMethods.push({
              id: pm.id,
              brand: pm.card.brand?.charAt(0).toUpperCase() + pm.card.brand?.slice(1) || 'Card',
              last4: pm.card.last4,
              exp_month: pm.card.exp_month,
              exp_year: pm.card.exp_year,
              is_default: pm.id === customerData.data[0].invoice_settings?.default_payment_method
            });
          }
        }
      }
    } catch (error) {
      logStep("Error fetching payment methods", { error: error instanceof Error ? error.message : String(error) });
    }

    // Sort by date (newest first)
    payments.sort((a, b) => b.created - a.created);

    logStep("Payment history retrieved", { paymentsCount: payments.length, paymentMethodsCount: paymentMethods.length });

    return new Response(JSON.stringify({ payments, paymentMethods }), {
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