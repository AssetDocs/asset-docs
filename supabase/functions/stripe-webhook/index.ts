import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

const logStep = (step: string, details?: any) => {
  console.log(`[STRIPE-WEBHOOK] ${step}`, details ? JSON.stringify(details) : '');
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Webhook received');

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!stripeSecretKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }
    
    // SECURITY: Webhook secret is required for signature verification
    if (!webhookSecret) {
      logStep('ERROR: STRIPE_WEBHOOK_SECRET is not configured');
      return new Response('Webhook secret not configured', { 
        status: 500,
        headers: corsHeaders 
      });
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const signature = req.headers.get('stripe-signature');
    const body = await req.text();

    // SECURITY: Require signature header
    if (!signature) {
      logStep('ERROR: Missing stripe-signature header');
      return new Response('Missing signature', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    let event: Stripe.Event;

    // SECURITY: Always verify webhook signature
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logStep('Webhook signature verified');
    } catch (err) {
      const error = err as Error;
      logStep('Webhook signature verification failed', { error: error.message });
      return new Response('Invalid signature', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    logStep('Processing event', { type: event.type, id: event.id });

    // Log the event to payment_events table
    const { error: logError } = await supabase
      .from('payment_events')
      .insert({
        stripe_event_id: event.id,
        event_type: event.type,
        event_data: event.data,
        status: 'received'
      });

    if (logError) {
      logStep('Error logging event', logError);
    }

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(supabase, subscription, event.type);
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(supabase, subscription);
        break;
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(supabase, invoice);
        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(supabase, invoice);
        break;
      }
      
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(supabase, session);
        break;
      }
      
      default:
        logStep('Unhandled event type', { type: event.type });
    }

    // Update event status to processed
    await supabase
      .from('payment_events')
      .update({ status: 'processed', processed_at: new Date().toISOString() })
      .eq('stripe_event_id', event.id);

    logStep('Webhook processed successfully');

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const err = error as Error;
    const errorId = crypto.randomUUID();
    logStep('ERROR in stripe-webhook', { errorId, message: err.message, stack: err.stack });
    return new Response(
      JSON.stringify({ 
        error: 'Webhook processing failed',
        errorId 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function handleSubscriptionChange(supabase: any, subscription: Stripe.Subscription, eventType: string) {
  logStep('Handling subscription change', { subscriptionId: subscription.id, eventType });

  const customer = await getCustomerEmail(subscription.customer as string);
  if (!customer?.email) {
    logStep('No customer email found');
    return;
  }

  const tier = getSubscriptionTier(subscription);
  const isActive = subscription.status === 'active';
  const subscriptionEnd = subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null;

  // Find user by email
  const { data: user } = await supabase.auth.admin.getUserByEmail(customer.email);
  
  let isNewSubscription = false;

  if (user?.user) {
    // Check if subscriber already exists
    const { data: existingSubscriber } = await supabase
      .from('subscribers')
      .select('*')
      .eq('user_id', user.user.id)
      .single();

    // Update or create subscriber record
    const { error } = await supabase
      .from('subscribers')
      .upsert({
        user_id: user.user.id,
        email: customer.email,
        stripe_customer_id: subscription.customer,
        subscribed: isActive,
        subscription_tier: tier,
        subscription_end: subscriptionEnd?.toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      logStep('Error updating subscriber', error);
    } else {
      logStep('Subscriber updated successfully');
      
      // If this is a new subscription (first time subscriber) and it's active, send welcome email
      if (!existingSubscriber && isActive && eventType === 'customer.subscription.created') {
        isNewSubscription = true;
        logStep('Triggering welcome email for new subscription', { email: customer.email });
        
        try {
          const { error: emailError } = await supabase.functions.invoke('send-subscription-welcome-email', {
            body: {
              email: customer.email,
              subscription_tier: tier,
              trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
            }
          });

          if (emailError) {
            logStep('Error sending welcome email', emailError);
          } else {
            logStep('Welcome email sent successfully to', { email: customer.email });
          }
        } catch (error) {
          logStep('Failed to send welcome email', error);
        }
      }
    }
  }
}

async function handleSubscriptionDeleted(supabase: any, subscription: Stripe.Subscription) {
  logStep('Handling subscription deletion', { subscriptionId: subscription.id });

  const { error } = await supabase
    .from('subscribers')
    .update({
      subscribed: false,
      subscription_end: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', subscription.customer);

  if (error) {
    logStep('Error updating deleted subscription', error);
  }
}

async function handlePaymentSucceeded(supabase: any, invoice: Stripe.Invoice) {
  logStep('Handling payment success', { invoiceId: invoice.id });
  
  // Update payment failure flags
  const { error } = await supabase
    .from('subscribers')
    .update({
      payment_failure_reminder_sent: false,
      payment_failure_reminder_sent_at: null,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', invoice.customer);

  if (error) {
    logStep('Error clearing payment failure flags', error);
  }
}

async function handlePaymentFailed(supabase: any, invoice: Stripe.Invoice) {
  logStep('Handling payment failure', { invoiceId: invoice.id });
  
  // Mark for payment failure handling
  const { error } = await supabase
    .from('subscribers')
    .update({
      last_payment_failure_check: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', invoice.customer);

  if (error) {
    logStep('Error updating payment failure', error);
  }
}

async function handleCheckoutCompleted(supabase: any, session: Stripe.Checkout.Session) {
  logStep('Handling checkout completion', { sessionId: session.id });

  // Handle gift subscriptions
  if (session.metadata?.gift_code) {
    const { error } = await supabase
      .from('gift_subscriptions')
      .update({ status: 'paid' })
      .eq('gift_code', session.metadata.gift_code);

    if (error) {
      logStep('Error updating gift subscription', error);
    }
  }
}

function getSubscriptionTier(subscription: Stripe.Subscription): string {
  if (!subscription.items?.data?.[0]?.price?.unit_amount) return 'basic';
  
  const amount = subscription.items.data[0].price.unit_amount;
  
  if (amount >= 4999) return 'premium';
  if (amount >= 2999) return 'standard'; 
  return 'basic';
}

async function getCustomerEmail(customerId: string) {
  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!stripeSecretKey) return null;

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2023-10-16',
  });

  try {
    return await stripe.customers.retrieve(customerId) as Stripe.Customer;
  } catch (error) {
    logStep('Error retrieving customer', error);
    return null;
  }
}