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

    // SECURITY: Always verify webhook signature (use async version for Deno)
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
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
        // Send payment receipt email
        await sendPaymentReceipt(supabase, session);
        break;
      }
      
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await sendPaymentReceiptFromIntent(supabase, paymentIntent);
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

  const priceId = subscription.items.data[0]?.price?.id || '';
  const stripeStatus = subscription.status;
  const currentPeriodEnd = subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null;
  
  // Check if this is a storage add-on subscription
  const isStorageAddon = subscription.metadata?.type === 'storage_addon';
  
  if (isStorageAddon) {
    // Handle storage add-on separately
    const storageAmountGb = parseInt(subscription.metadata?.storage_amount_gb || '50');
    
    // List users filtered by email (since getUserByEmail doesn't work in Deno)
    const { data: usersData } = await supabase.auth.admin.listUsers();
    const user = usersData?.users?.find((u: any) => u.email === customer.email);
    
    if (user) {
      // Get current storage quota
      const { data: profile } = await supabase
        .from('profiles')
        .select('storage_quota_gb')
        .eq('user_id', user.id)
        .single();
      
      const currentQuota = profile?.storage_quota_gb || 5;
      const newQuota = currentQuota + storageAmountGb;
      
      // Update profile with additional storage
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          storage_quota_gb: newQuota,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
      
      if (profileError) {
        logStep('Error updating storage quota', profileError);
      } else {
        logStep('Storage quota updated successfully', { 
          previousQuota: currentQuota, 
          newQuota: newQuota 
        });
      }
    }
    return;
  }
  
  // Determine plan limits based on price
  const { propertyLimit, storageQuotaGb, tier } = getPlanLimits(priceId);

  // Find user by email (list users and filter since getUserByEmail doesn't work in Deno)
  const { data: usersData } = await supabase.auth.admin.listUsers();
  const user = usersData?.users?.find((u: any) => u.email === customer.email);
  
  if (user) {
    // Check current profile status to prevent downgrading from 'active' to 'incomplete'
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, plan_status')
      .eq('user_id', user.id)
      .single();

    // Determine the final plan status - don't downgrade from 'active' to 'incomplete'
    let finalPlanStatus = stripeStatus;
    if (existingProfile?.plan_status === 'active' && stripeStatus === 'incomplete') {
      logStep('Keeping active status instead of downgrading to incomplete');
      finalPlanStatus = 'active';
    }
    
    // Map Stripe statuses to ensure 'active' is properly set
    if (stripeStatus === 'trialing' || stripeStatus === 'active') {
      finalPlanStatus = 'active';
    }

    const isNewSubscription = !existingProfile?.stripe_customer_id && (finalPlanStatus === 'active');

    // Update profile with subscription data
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        stripe_customer_id: subscription.customer,
        plan_id: priceId,
        plan_status: finalPlanStatus,
        current_period_end: currentPeriodEnd?.toISOString(),
        property_limit: propertyLimit,
        storage_quota_gb: storageQuotaGb,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (profileError) {
      logStep('Error updating profile', profileError);
    } else {
      logStep('Profile updated successfully', { planStatus: finalPlanStatus, stripeStatus });
    }

    // Also maintain backwards compatibility with subscribers table
    const { error: subscriberError } = await supabase
      .from('subscribers')
      .upsert({
        user_id: user.id,
        email: customer.email,
        stripe_customer_id: subscription.customer,
        subscribed: finalPlanStatus === 'active',
        subscription_tier: tier,
        subscription_end: currentPeriodEnd?.toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (subscriberError) {
      logStep('Error updating subscriber (backwards compat)', subscriberError);
    }

    // Send welcome email for new subscriptions
    if (isNewSubscription) {
      logStep('Triggering welcome email for new subscription', { email: customer.email });
      
      try {
        await supabase.functions.invoke('send-subscription-welcome-email', {
          body: {
            email: customer.email,
            subscription_tier: tier,
            trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
            current_period_end: currentPeriodEnd?.toISOString()
          }
        });
        logStep('Welcome email sent successfully');
      } catch (error) {
        logStep('Failed to send welcome email', error);
      }
    }
  }
}

async function handleSubscriptionDeleted(supabase: any, subscription: Stripe.Subscription) {
  logStep('Handling subscription deletion', { subscriptionId: subscription.id });

  // Update profile
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      plan_status: 'canceled',
      current_period_end: new Date().toISOString(),
      property_limit: 1,
      storage_quota_gb: 5,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', subscription.customer);

  if (profileError) {
    logStep('Error updating profile for deleted subscription', profileError);
  }

  // Update subscribers table for backwards compatibility
  const { error: subscriberError } = await supabase
    .from('subscribers')
    .update({
      subscribed: false,
      subscription_end: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', subscription.customer);

  if (subscriberError) {
    logStep('Error updating subscriber for deleted subscription', subscriberError);
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
  
  // Update profile with past_due status
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      plan_status: 'past_due',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', invoice.customer);

  if (profileError) {
    logStep('Error updating profile for payment failure', profileError);
  }

  // Update subscribers table for backwards compatibility
  const { error: subscriberError } = await supabase
    .from('subscribers')
    .update({
      last_payment_failure_check: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', invoice.customer);

  if (subscriberError) {
    logStep('Error updating subscriber for payment failure', subscriberError);
  }
}

async function handleCheckoutCompleted(supabase: any, session: Stripe.Checkout.Session) {
  logStep('Handling checkout completion', { sessionId: session.id, mode: session.mode, metadata: session.metadata });

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

  // Handle storage add-on checkout
  if (session.metadata?.type === 'storage_addon') {
    logStep('Processing storage add-on from checkout', { 
      userId: session.metadata.user_id, 
      storageAmount: session.metadata.storage_amount_gb 
    });
    
    const userId = session.metadata.user_id;
    const storageAmountGb = parseInt(session.metadata.storage_amount_gb || '50');
    
    if (userId) {
      // Get current storage quota
      const { data: profile } = await supabase
        .from('profiles')
        .select('storage_quota_gb')
        .eq('user_id', userId)
        .single();
      
      const currentQuota = profile?.storage_quota_gb || 25;
      const newQuota = currentQuota + storageAmountGb;
      
      // Update profile with additional storage
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          storage_quota_gb: newQuota,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (profileError) {
        logStep('Error updating storage quota from checkout', profileError);
      } else {
        logStep('Storage quota updated from checkout', { 
          previousQuota: currentQuota, 
          newQuota: newQuota 
        });
      }
    }
    return; // Don't process as regular subscription
  }

  // Handle regular subscription checkout - activate profile immediately
  if (session.mode === 'subscription' && session.customer_email) {
    logStep('Activating subscription from checkout', { email: session.customer_email });
    
    // Find user by email
    const { data: usersData } = await supabase.auth.admin.listUsers();
    const user = usersData?.users?.find((u: any) => u.email === session.customer_email);
    
    if (user) {
      // Get plan type from metadata or default to standard
      const planType = session.metadata?.plan_type || 'standard';
      const limits = getPlanLimitsFromType(planType);
      
      // Update profile to active status
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          stripe_customer_id: session.customer,
          plan_id: planType,
          plan_status: 'active',
          property_limit: limits.propertyLimit,
          storage_quota_gb: limits.storageQuotaGb,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (profileError) {
        logStep('Error updating profile from checkout', profileError);
      } else {
        logStep('Profile activated from checkout', { userId: user.id, planType });
      }

      // Update subscribers table for backwards compatibility
      const { error: subscriberError } = await supabase
        .from('subscribers')
        .upsert({
          user_id: user.id,
          email: session.customer_email,
          stripe_customer_id: session.customer,
          subscribed: true,
          subscription_tier: limits.tier,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (subscriberError) {
        logStep('Error updating subscriber from checkout', subscriberError);
      }

      // Send welcome email
      try {
        await supabase.functions.invoke('send-subscription-welcome-email', {
          body: {
            email: session.customer_email,
            subscription_tier: limits.tier
          }
        });
        logStep('Welcome email sent');
      } catch (error) {
        logStep('Failed to send welcome email', error);
      }
    }
  }
}

function getPlanLimits(priceId: string): { propertyLimit: number; storageQuotaGb: number; tier: string } {
  // Map Stripe price IDs to plan limits
  // Standard plans: 3 properties, 25GB
  // Premium plans: unlimited properties (-1), 100GB
  
  const priceLower = priceId.toLowerCase();
  
  if (priceLower.includes('premium') || priceLower.includes('professional')) {
    return {
      propertyLimit: -1, // -1 means unlimited
      storageQuotaGb: 100,
      tier: 'premium'
    };
  } else if (priceLower.includes('standard') || priceLower.includes('homeowner')) {
    return {
      propertyLimit: 3,
      storageQuotaGb: 25,
      tier: 'standard'
    };
  }
  
  // Fallback to standard tier for any other subscription
  return {
    propertyLimit: 3,
    storageQuotaGb: 25,
    tier: 'standard'
  };
}

function getPlanLimitsFromType(planType: string): { propertyLimit: number; storageQuotaGb: number; tier: string } {
  const typeLower = planType.toLowerCase();
  
  if (typeLower === 'premium' || typeLower === 'professional') {
    return {
      propertyLimit: -1,
      storageQuotaGb: 100,
      tier: 'premium'
    };
  }
  
  // Default to standard
  return {
    propertyLimit: 3,
    storageQuotaGb: 25,
    tier: 'standard'
  };
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

async function sendPaymentReceipt(supabase: any, session: Stripe.Checkout.Session) {
  try {
    logStep('Triggering payment receipt email', { sessionId: session.id });
    
    const customerEmail = session.customer_details?.email || session.customer_email;
    const customerName = session.customer_details?.name || 'Customer';
    
    if (!customerEmail) {
      logStep('No customer email for receipt');
      return;
    }

    await supabase.functions.invoke('send-payment-receipt-internal', {
      body: {
        customerEmail,
        customerName,
        amount: session.amount_total || 0,
        currency: session.currency || 'usd',
        transactionId: session.id,
        planType: session.metadata?.plan_type || 'standard'
      }
    });
    
    logStep('Payment receipt triggered successfully');
  } catch (error) {
    logStep('Failed to trigger payment receipt', error);
  }
}

async function sendPaymentReceiptFromIntent(supabase: any, paymentIntent: Stripe.PaymentIntent) {
  try {
    logStep('Triggering payment receipt from intent', { paymentIntentId: paymentIntent.id });
    
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) return;
    
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' });
    
    // Get customer email if customer exists
    let customerEmail = paymentIntent.receipt_email;
    let customerName = 'Customer';
    
    if (!customerEmail && paymentIntent.customer) {
      const customer = await stripe.customers.retrieve(paymentIntent.customer as string) as Stripe.Customer;
      customerEmail = customer.email || '';
      customerName = customer.name || 'Customer';
    }
    
    if (!customerEmail) {
      logStep('No customer email for receipt from intent');
      return;
    }

    await supabase.functions.invoke('send-payment-receipt-internal', {
      body: {
        customerEmail,
        customerName,
        amount: paymentIntent.amount || 0,
        currency: paymentIntent.currency || 'usd',
        transactionId: paymentIntent.id,
        planType: 'subscription'
      }
    });
    
    logStep('Payment receipt from intent triggered successfully');
  } catch (error) {
    logStep('Failed to trigger payment receipt from intent', error);
  }
}