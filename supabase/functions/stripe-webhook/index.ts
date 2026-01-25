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
    
    if (!webhookSecret) {
      logStep('ERROR: STRIPE_WEBHOOK_SECRET is not configured');
      return new Response('Webhook secret not configured', { 
        status: 500,
        headers: corsHeaders 
      });
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' });
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const signature = req.headers.get('stripe-signature');
    const body = await req.text();

    if (!signature) {
      logStep('ERROR: Missing stripe-signature header');
      return new Response('Missing signature', { status: 400, headers: corsHeaders });
    }

    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
      logStep('Webhook signature verified');
    } catch (err) {
      const error = err as Error;
      logStep('Webhook signature verification failed', { error: error.message });
      return new Response('Invalid signature', { status: 400, headers: corsHeaders });
    }

    // IDEMPOTENCY CHECK: Skip if event already processed
    const { data: existingEvent } = await supabase
      .from('stripe_events')
      .select('id, processed_at')
      .eq('stripe_event_id', event.id)
      .maybeSingle();

    if (existingEvent?.processed_at) {
      logStep('Event already processed, skipping', { eventId: event.id });
      return new Response(JSON.stringify({ received: true, skipped: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Record event for idempotency (mark as received but not processed yet)
    const { error: insertEventError } = await supabase
      .from('stripe_events')
      .upsert({
        stripe_event_id: event.id,
        event_type: event.type,
        payload: event.data,
        outcome: 'received'
      }, { onConflict: 'stripe_event_id' });

    if (insertEventError) {
      logStep('Error recording stripe event', insertEventError);
    }

    logStep('Processing event', { type: event.type, id: event.id });

    // Extract common fields for payment_events table
    const eventObject = event.data.object as any;
    const customerId = eventObject.customer || eventObject.customer_id || null;
    const subscriptionId = eventObject.subscription || eventObject.id || null;
    let amount: number | null = null;
    let currency: string = 'usd';
    
    if (eventObject.amount_total) {
      amount = eventObject.amount_total;
    } else if (eventObject.amount_paid) {
      amount = eventObject.amount_paid;
    } else if (eventObject.amount) {
      amount = eventObject.amount;
    } else if (eventObject.plan?.amount) {
      amount = eventObject.plan.amount;
    }
    
    if (eventObject.currency) {
      currency = eventObject.currency;
    }

    // Log to payment_events for audit trail
    await supabase
      .from('payment_events')
      .insert({
        stripe_event_id: event.id,
        event_type: event.type,
        event_data: event.data,
        status: 'received',
        customer_id: customerId,
        subscription_id: typeof subscriptionId === 'string' ? subscriptionId : null,
        amount: amount,
        currency: currency
      });

    // Process event based on type
    let outcome = 'processed';
    try {
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription;
          await handleSubscriptionChange(supabase, stripe, subscription, event.type, event.id);
          break;
        }
        
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          await handleSubscriptionDeleted(supabase, stripe, subscription, event.id);
          break;
        }
        
        case 'invoice.payment_succeeded':
        case 'invoice.paid': {
          const invoice = event.data.object as Stripe.Invoice;
          await handlePaymentSucceeded(supabase, stripe, invoice, event.id);
          break;
        }
        
        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          await handlePaymentFailed(supabase, stripe, invoice, event.id);
          break;
        }
        
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          await handleCheckoutCompleted(supabase, stripe, session, event.id);
          await sendPaymentReceipt(supabase, session);
          break;
        }
        
        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          await sendPaymentReceiptFromIntent(supabase, stripe, paymentIntent);
          break;
        }
        
        default:
          logStep('Unhandled event type', { type: event.type });
          outcome = 'unhandled';
      }
    } catch (processingError) {
      outcome = 'error';
      logStep('Error processing event', { error: (processingError as Error).message });
    }

    // Mark event as processed with outcome
    await supabase
      .from('stripe_events')
      .update({ 
        processed_at: new Date().toISOString(),
        outcome: outcome
      })
      .eq('stripe_event_id', event.id);

    // Update payment_events status
    await supabase
      .from('payment_events')
      .update({ status: 'processed', processed_at: new Date().toISOString() })
      .eq('stripe_event_id', event.id);

    logStep('Webhook processed successfully', { outcome });

    return new Response(JSON.stringify({ received: true, outcome }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const err = error as Error;
    const errorId = crypto.randomUUID();
    logStep('ERROR in stripe-webhook', { errorId, message: err.message, stack: err.stack });
    return new Response(
      JSON.stringify({ error: 'Webhook processing failed', errorId }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// ============================================================================
// HANDLER FUNCTIONS
// ============================================================================

async function handleSubscriptionChange(
  supabase: any, 
  stripe: Stripe, 
  subscription: Stripe.Subscription, 
  eventType: string,
  sourceEventId: string
) {
  logStep('Handling subscription change', { subscriptionId: subscription.id, eventType });

  const customer = await getCustomerEmail(stripe, subscription.customer as string);
  if (!customer?.email) {
    logStep('No customer email found');
    return;
  }

  const priceId = subscription.items.data[0]?.price?.id || '';
  const stripeStatus = subscription.status;
  const currentPeriodEnd = subscription.current_period_end 
    ? new Date(subscription.current_period_end * 1000) 
    : null;
  
  // Check if storage add-on
  if (subscription.metadata?.type === 'storage_addon') {
    await handleStorageAddon(supabase, customer.email, subscription);
    return;
  }
  
  const { propertyLimit, storageQuotaGb, tier, plan } = getPlanLimits(priceId);

  // Find user by email
  const { data: usersData } = await supabase.auth.admin.listUsers();
  const user = usersData?.users?.find((u: any) => u.email === customer.email);
  
  if (!user) {
    logStep('No user found for email', { email: customer.email });
    return;
  }

  // Map Stripe status to entitlement status
  const entitlementStatus = mapStripeStatusToEntitlement(stripeStatus);
  
  // Check existing entitlement to prevent downgrade from active to incomplete
  const { data: existingEntitlement } = await supabase
    .from('entitlements')
    .select('status')
    .eq('user_id', user.id)
    .maybeSingle();

  let finalStatus = entitlementStatus;
  if (existingEntitlement?.status === 'active' && entitlementStatus === 'incomplete') {
    logStep('Keeping active status instead of downgrading to incomplete');
    finalStatus = 'active';
  }

  const isNewSubscription = !existingEntitlement && finalStatus === 'active';

  // UPSERT entitlements (single source of truth)
  const { error: entitlementError } = await supabase
    .from('entitlements')
    .upsert({
      user_id: user.id,
      plan: plan,
      status: finalStatus,
      current_period_end: currentPeriodEnd?.toISOString(),
      source_event_id: sourceEventId,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });

  if (entitlementError) {
    logStep('Error upserting entitlement', entitlementError);
  } else {
    logStep('Entitlement upserted successfully', { plan, status: finalStatus });
  }

  // BACKWARDS COMPAT: Also update profiles table
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      stripe_customer_id: subscription.customer,
      plan_id: priceId,
      plan_status: finalStatus,
      current_period_end: currentPeriodEnd?.toISOString(),
      property_limit: propertyLimit,
      storage_quota_gb: storageQuotaGb,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', user.id);

  if (profileError) {
    logStep('Error updating profile', profileError);
  }

  // BACKWARDS COMPAT: Update subscribers table
  await supabase
    .from('subscribers')
    .upsert({
      user_id: user.id,
      email: customer.email,
      stripe_customer_id: subscription.customer,
      subscribed: finalStatus === 'active',
      subscription_tier: tier,
      subscription_end: currentPeriodEnd?.toISOString(),
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });

  // Send welcome email for new subscriptions
  if (isNewSubscription) {
    logStep('Triggering welcome email', { email: customer.email });
    try {
      await supabase.functions.invoke('send-subscription-welcome-email', {
        body: {
          email: customer.email,
          subscription_tier: tier,
          trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
          current_period_end: currentPeriodEnd?.toISOString()
        }
      });
    } catch (error) {
      logStep('Failed to send welcome email', error);
    }
  }
}

async function handleSubscriptionDeleted(
  supabase: any, 
  stripe: Stripe, 
  subscription: Stripe.Subscription,
  sourceEventId: string
) {
  logStep('Handling subscription deletion', { subscriptionId: subscription.id });

  const customer = await getCustomerEmail(stripe, subscription.customer as string);
  
  // Find user by customer ID or email
  let userId: string | null = null;
  
  if (customer?.email) {
    const { data: usersData } = await supabase.auth.admin.listUsers();
    const user = usersData?.users?.find((u: any) => u.email === customer.email);
    userId = user?.id;
  }

  if (userId) {
    // Update entitlements to canceled
    await supabase
      .from('entitlements')
      .update({
        status: 'canceled',
        current_period_end: new Date().toISOString(),
        source_event_id: sourceEventId,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
  }

  // BACKWARDS COMPAT: Update profile
  await supabase
    .from('profiles')
    .update({
      plan_status: 'canceled',
      current_period_end: new Date().toISOString(),
      property_limit: 1,
      storage_quota_gb: 5,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', subscription.customer);

  // BACKWARDS COMPAT: Update subscribers
  await supabase
    .from('subscribers')
    .update({
      subscribed: false,
      subscription_end: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', subscription.customer);
}

async function handlePaymentSucceeded(
  supabase: any, 
  stripe: Stripe, 
  invoice: Stripe.Invoice,
  sourceEventId: string
) {
  logStep('Handling payment success', { invoiceId: invoice.id });
  
  // Get customer and find user
  if (invoice.customer) {
    const customer = await getCustomerEmail(stripe, invoice.customer as string);
    if (customer?.email) {
      const { data: usersData } = await supabase.auth.admin.listUsers();
      const user = usersData?.users?.find((u: any) => u.email === customer.email);
      
      if (user) {
        // Ensure entitlement is active on successful payment
        const { data: entitlement } = await supabase
          .from('entitlements')
          .select('status')
          .eq('user_id', user.id)
          .maybeSingle();

        if (entitlement && entitlement.status !== 'active') {
          await supabase
            .from('entitlements')
            .update({
              status: 'active',
              source_event_id: sourceEventId,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id);
        }
      }
    }
  }

  // BACKWARDS COMPAT: Clear payment failure flags
  await supabase
    .from('subscribers')
    .update({
      payment_failure_reminder_sent: false,
      payment_failure_reminder_sent_at: null,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', invoice.customer);
}

async function handlePaymentFailed(
  supabase: any, 
  stripe: Stripe, 
  invoice: Stripe.Invoice,
  sourceEventId: string
) {
  logStep('Handling payment failure', { invoiceId: invoice.id });
  
  // Get customer and find user
  if (invoice.customer) {
    const customer = await getCustomerEmail(stripe, invoice.customer as string);
    if (customer?.email) {
      const { data: usersData } = await supabase.auth.admin.listUsers();
      const user = usersData?.users?.find((u: any) => u.email === customer.email);
      
      if (user) {
        // Update entitlement to past_due
        await supabase
          .from('entitlements')
          .update({
            status: 'past_due',
            source_event_id: sourceEventId,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
      }
    }
  }

  // BACKWARDS COMPAT: Update profile
  await supabase
    .from('profiles')
    .update({
      plan_status: 'past_due',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', invoice.customer);

  // BACKWARDS COMPAT: Update subscribers
  await supabase
    .from('subscribers')
    .update({
      last_payment_failure_check: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', invoice.customer);
}

async function handleCheckoutCompleted(
  supabase: any, 
  stripe: Stripe, 
  session: Stripe.Checkout.Session,
  sourceEventId: string
) {
  logStep('Handling checkout completion', { sessionId: session.id, mode: session.mode, metadata: session.metadata });

  // Handle gift subscriptions
  if (session.metadata?.gift_code) {
    await supabase
      .from('gift_subscriptions')
      .update({ status: 'paid' })
      .eq('gift_code', session.metadata.gift_code);
  }

  // Handle storage add-on
  if (session.metadata?.type === 'storage_addon') {
    const userId = session.metadata.user_id;
    const storageAmountGb = parseInt(session.metadata.storage_amount_gb || '50');
    
    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('storage_quota_gb')
        .eq('user_id', userId)
        .single();
      
      const currentQuota = profile?.storage_quota_gb || 25;
      const newQuota = currentQuota + storageAmountGb;
      
      await supabase
        .from('profiles')
        .update({
          storage_quota_gb: newQuota,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      logStep('Storage quota updated from checkout', { previousQuota: currentQuota, newQuota });
    }
    return;
  }

  // Handle regular subscription checkout
  if (session.mode === 'subscription' && session.customer_email) {
    logStep('Activating subscription from checkout', { email: session.customer_email });
    
    const { data: usersData } = await supabase.auth.admin.listUsers();
    const user = usersData?.users?.find((u: any) => u.email === session.customer_email);
    
    if (user) {
      const planType = session.metadata?.plan_type || 'standard';
      const limits = getPlanLimitsFromType(planType);
      
      // UPSERT entitlement (source of truth)
      await supabase
        .from('entitlements')
        .upsert({
          user_id: user.id,
          plan: limits.plan,
          status: 'active',
          source_event_id: sourceEventId,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      logStep('Entitlement activated from checkout', { userId: user.id, plan: limits.plan });

      // BACKWARDS COMPAT: Update profile
      await supabase
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

      // BACKWARDS COMPAT: Update subscribers
      await supabase
        .from('subscribers')
        .upsert({
          user_id: user.id,
          email: session.customer_email,
          stripe_customer_id: session.customer,
          subscribed: true,
          subscription_tier: limits.tier,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      // Send welcome email
      try {
        await supabase.functions.invoke('send-subscription-welcome-email', {
          body: {
            email: session.customer_email,
            subscription_tier: limits.tier
          }
        });
      } catch (error) {
        logStep('Failed to send welcome email', error);
      }
    }
  }
}

async function handleStorageAddon(supabase: any, email: string, subscription: Stripe.Subscription) {
  const storageAmountGb = parseInt(subscription.metadata?.storage_amount_gb || '50');
  
  const { data: usersData } = await supabase.auth.admin.listUsers();
  const user = usersData?.users?.find((u: any) => u.email === email);
  
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('storage_quota_gb')
      .eq('user_id', user.id)
      .single();
    
    const currentQuota = profile?.storage_quota_gb || 5;
    const newQuota = currentQuota + storageAmountGb;
    
    await supabase
      .from('profiles')
      .update({
        storage_quota_gb: newQuota,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);
    
    logStep('Storage quota updated', { previousQuota: currentQuota, newQuota });
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function mapStripeStatusToEntitlement(stripeStatus: string): string {
  switch (stripeStatus) {
    case 'active':
    case 'trialing':
      return 'active';
    case 'past_due':
      return 'past_due';
    case 'canceled':
    case 'unpaid':
      return 'canceled';
    case 'incomplete':
    case 'incomplete_expired':
      return 'inactive';
    default:
      return 'inactive';
  }
}

function getPlanLimits(priceId: string): { propertyLimit: number; storageQuotaGb: number; tier: string; plan: string } {
  const priceLower = priceId.toLowerCase();
  
  if (priceLower.includes('premium') || priceLower.includes('professional')) {
    return { propertyLimit: -1, storageQuotaGb: 100, tier: 'premium', plan: 'premium' };
  } else if (priceLower.includes('standard') || priceLower.includes('homeowner')) {
    return { propertyLimit: 3, storageQuotaGb: 25, tier: 'standard', plan: 'standard' };
  }
  
  return { propertyLimit: 3, storageQuotaGb: 25, tier: 'standard', plan: 'standard' };
}

function getPlanLimitsFromType(planType: string): { propertyLimit: number; storageQuotaGb: number; tier: string; plan: string } {
  const typeLower = planType.toLowerCase();
  
  if (typeLower === 'premium' || typeLower === 'professional') {
    return { propertyLimit: -1, storageQuotaGb: 100, tier: 'premium', plan: 'premium' };
  }
  
  return { propertyLimit: 3, storageQuotaGb: 25, tier: 'standard', plan: 'standard' };
}

async function getCustomerEmail(stripe: Stripe, customerId: string): Promise<Stripe.Customer | null> {
  try {
    return await stripe.customers.retrieve(customerId) as Stripe.Customer;
  } catch (error) {
    logStep('Error retrieving customer', error);
    return null;
  }
}

async function sendPaymentReceipt(supabase: any, session: Stripe.Checkout.Session) {
  try {
    const customerEmail = session.customer_details?.email || session.customer_email;
    const customerName = session.customer_details?.name || 'Customer';
    
    if (!customerEmail) return;

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
    
    logStep('Payment receipt triggered');
  } catch (error) {
    logStep('Failed to trigger payment receipt', error);
  }
}

async function sendPaymentReceiptFromIntent(supabase: any, stripe: Stripe, paymentIntent: Stripe.PaymentIntent) {
  try {
    let customerEmail = paymentIntent.receipt_email;
    let customerName = 'Customer';
    
    if (!customerEmail && paymentIntent.customer) {
      const customer = await stripe.customers.retrieve(paymentIntent.customer as string) as Stripe.Customer;
      customerEmail = customer.email || '';
      customerName = customer.name || 'Customer';
    }
    
    if (!customerEmail) return;

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
    
    logStep('Payment receipt from intent triggered');
  } catch (error) {
    logStep('Failed to trigger payment receipt from intent', error);
  }
}
