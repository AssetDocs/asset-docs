import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-PAYMENT-FAILURES] ${step}${detailsStr}`);
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");

  if (!supabaseUrl || !serviceKey || !stripeKey) {
    logStep("ERROR: Missing environment variables");
    return new Response(
      JSON.stringify({ error: "Missing required environment variables" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

  try {
    logStep("Starting payment failure check");

    // Get all subscribers with active subscriptions
    const { data: subscribers, error: subscribersError } = await supabase
      .from("subscribers")
      .select("*")
      .eq("subscribed", true)
      .is("payment_failure_reminder_sent", false);

    if (subscribersError) {
      throw new Error(`Failed to fetch subscribers: ${subscribersError.message}`);
    }

    logStep("Found subscribers to check", { count: subscribers?.length || 0 });

    if (!subscribers || subscribers.length === 0) {
      return new Response(
        JSON.stringify({ message: "No subscribers to check" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = {
      checked: 0,
      payment_failures: 0,
      emails_sent: 0,
      errors: 0
    };

    for (const subscriber of subscribers) {
      try {
        results.checked++;
        logStep("Checking subscriber", { email: subscriber.email });

        if (!subscriber.stripe_customer_id) {
          logStep("Skipping subscriber without Stripe customer ID", { email: subscriber.email });
          continue;
        }

        // Get the customer's active subscriptions
        const subscriptions = await stripe.subscriptions.list({
          customer: subscriber.stripe_customer_id,
          status: "active",
          limit: 10,
        });

        let hasPaymentFailure = false;

        // Check each active subscription for payment failures
        for (const subscription of subscriptions.data) {
          // Check if the default payment method is valid
          if (subscription.default_payment_method) {
            try {
              const paymentMethod = await stripe.paymentMethods.retrieve(
                subscription.default_payment_method as string
              );
              
              // Check if card is expired
              if (paymentMethod.card) {
                const currentDate = new Date();
                const cardExpiry = new Date(paymentMethod.card.exp_year, paymentMethod.card.exp_month - 1);
                
                if (cardExpiry < currentDate) {
                  hasPaymentFailure = true;
                  logStep("Found expired card", { 
                    email: subscriber.email,
                    expiry: `${paymentMethod.card.exp_month}/${paymentMethod.card.exp_year}`
                  });
                  break;
                }
              }
            } catch (pmError: unknown) {
              logStep("Error retrieving payment method", { error: pmError instanceof Error ? pmError.message : String(pmError) });
              hasPaymentFailure = true;
              break;
            }
          }

          // Check recent invoices for payment failures
          const invoices = await stripe.invoices.list({
            customer: subscriber.stripe_customer_id,
            subscription: subscription.id,
            limit: 3,
            status: "open"
          });

          const failedInvoices = invoices.data.filter((invoice: any) => 
            invoice.status === "open" && 
            invoice.attempt_count > 0 &&
            invoice.next_payment_attempt
          );

          if (failedInvoices.length > 0) {
            hasPaymentFailure = true;
            logStep("Found failed payment attempts", { 
              email: subscriber.email,
              failedInvoices: failedInvoices.length 
            });
            break;
          }
        }

        if (hasPaymentFailure) {
          results.payment_failures++;
          logStep("Sending payment failure reminder", { email: subscriber.email });

          // Send reminder email
          const { error: emailError } = await supabase.functions.invoke("send-payment-reminder", {
            body: {
              email: subscriber.email,
              customerName: subscriber.email.split('@')[0], // Simple name extraction
              subscriptionTier: subscriber.subscription_tier || "Premium"
            }
          });

          if (emailError) {
            logStep("Failed to send reminder email", { 
              email: subscriber.email, 
              error: emailError.message 
            });
            results.errors++;
          } else {
            // Update the subscriber record
            const { error: updateError } = await supabase
              .from("subscribers")
              .update({
                payment_failure_reminder_sent: true,
                payment_failure_reminder_sent_at: new Date().toISOString(),
                last_payment_failure_check: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq("id", subscriber.id);

            if (updateError) {
              logStep("Failed to update subscriber record", { 
                email: subscriber.email, 
                error: updateError.message 
              });
              results.errors++;
            } else {
              results.emails_sent++;
              logStep("Successfully sent reminder and updated record", { email: subscriber.email });
            }
          }
        } else {
          // Update last check time even if no payment failure
          await supabase
            .from("subscribers")
            .update({
              last_payment_failure_check: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq("id", subscriber.id);

          logStep("No payment issues found", { email: subscriber.email });
        }

      } catch (error) {
        results.errors++;
        logStep("Error processing subscriber", { 
          email: subscriber.email, 
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    logStep("Payment failure check completed", results);

    return new Response(
      JSON.stringify({
        message: "Payment failure check completed",
        results
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    logStep("ERROR in check-payment-failures", { message: error instanceof Error ? error.message : String(error) });
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);