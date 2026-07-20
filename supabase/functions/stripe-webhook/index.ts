import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";
import { fulfillCheckout } from "../_shared/fulfillment.ts";


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

const logStep = (step: string, details?: any) => {
  console.log(`[STRIPE-WEBHOOK] ${step}`, details ? JSON.stringify(details) : '');
};

// Parse subscription items by lookup_key
function parseSubscriptionItems(items: Stripe.SubscriptionItem[]) {
  let plan = 'free';
  let planLookupKey: string | null = null;
  let planPriceId: string | null = null;
  let baseStorageGb = 0;
  let storageAddonBlocksQty = 0;

  for (const item of items) {
    const lookupKey = item.price?.lookup_key;
    if (!lookupKey) continue;

    if (
      lookupKey.startsWith('standard_') ||
      lookupKey.startsWith('premium_') ||
    lookupKey === 'asset_safe_monthly' ||
      lookupKey === 'asset_safe_annual' ||
      lookupKey === 'asset_safe_gift_annual'
    ) {
      // The Asset Safe Plan: all billing options map to the same 25 GB base.
      planLookupKey = lookupKey;
      planPriceId = item.price.id;
      plan = 'standard';
      baseStorageGb = 25;
    } else if (lookupKey === 'storage_25gb_monthly') {
      // Storage add-on - quantity-based
      storageAddonBlocksQty = item.quantity || 0;
    }
  }

  return { plan, planLookupKey, planPriceId, baseStorageGb, storageAddonBlocksQty };
}

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
      return new Response('Webhook secret not configured', { status: 500, headers: corsHeaders });
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' });
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const signature = req.headers.get('stripe-signature');
    const body = await req.text();

    if (!signature) {
      return new Response('Missing signature', { status: 400, headers: corsHeaders });
    }

    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      logStep('Webhook signature verification failed', { error: (err as Error).message });
      return new Response('Invalid signature', { status: 400, headers: corsHeaders });
    }

    let replayAttempt = false;

    // Atomically claim the Stripe event before running any handlers. A duplicate
    // insert means another delivery already processed or is currently processing it,
    // unless an admin has explicitly prepared a failed event for signed redelivery.
    const { error: claimError } = await supabase.from('stripe_events').insert({
      stripe_event_id: event.id,
      event_type: event.type,
      payload: event.data,
      outcome: 'pending'
    });

    if (claimError?.code === '23505') {
      const { data: existingEvent, error: existingEventError } = await supabase
        .from('stripe_events')
        .select('outcome, replay_status')
        .eq('stripe_event_id', event.id)
        .maybeSingle();

      if (existingEventError) throw existingEventError;

      if (existingEvent?.outcome === 'error' && existingEvent?.replay_status === 'requested') {
        const replayStartedAt = new Date().toISOString();
        const { data: replayClaimedEvent, error: replayClaimError } = await supabase
          .from('stripe_events')
          .update({
            outcome: 'pending',
            payload: event.data,
            replay_status: 'processing',
            last_replayed_at: replayStartedAt,
            error_message: null,
            last_error_at: null,
          })
          .eq('stripe_event_id', event.id)
          .eq('replay_status', 'requested')
          .select('stripe_event_id')
          .maybeSingle();

        if (replayClaimError) throw replayClaimError;
        if (!replayClaimedEvent) {
          logStep('Replay already claimed, skipping', { eventId: event.id });
          return new Response(JSON.stringify({ received: true, skipped: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        await supabase
          .from('stripe_event_replay_requests')
          .update({ status: 'processing' })
          .eq('stripe_event_id', event.id)
          .eq('status', 'requested');

        replayAttempt = true;
        logStep('Replaying requested event', { eventId: event.id });
      } else {
        logStep('Event already claimed, skipping', { eventId: event.id });
        return new Response(JSON.stringify({ received: true, skipped: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }
    if (claimError && claimError.code !== '23505') throw claimError;

    logStep('Processing event', { type: event.type, id: event.id });

    // Log to payment_events for audit trail
    const eventObject = event.data.object as any;
    const customerId = eventObject.customer || eventObject.customer_id || null;
    const subscriptionId = eventObject.subscription || eventObject.id || null;
    let amount: number | null = eventObject.amount_total || eventObject.amount_paid || eventObject.amount || eventObject.plan?.amount || null;
    
    const { error: paymentEventInsertError } = await supabase.from('payment_events').insert({
      stripe_event_id: event.id,
      event_type: event.type,
      event_data: event.data,
      status: 'received',
      customer_id: customerId,
      subscription_id: typeof subscriptionId === 'string' ? subscriptionId : null,
      amount: amount,
      currency: eventObject.currency || 'usd'
    });
    if (paymentEventInsertError?.code === '23505') {
      await supabase.from('payment_events').update({
        event_type: event.type,
        event_data: event.data,
        status: 'received',
        customer_id: customerId,
        subscription_id: typeof subscriptionId === 'string' ? subscriptionId : null,
        amount: amount,
        currency: eventObject.currency || 'usd'
      }).eq('stripe_event_id', event.id);
    } else if (paymentEventInsertError) {
      throw paymentEventInsertError;
    }

    let outcome = 'success';
    let errorMessage: string | null = null;
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
        case 'checkout.session.async_payment_failed': {
          const session = event.data.object as Stripe.Checkout.Session;
          await handleGiftCheckoutFailed(supabase, session, 'checkout.session.async_payment_failed');
          break;
        }
        case 'checkout.session.expired': {
          const session = event.data.object as Stripe.Checkout.Session;
          await handleGiftCheckoutExpired(supabase, session);
          break;
        }
        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          await sendPaymentReceiptFromIntent(supabase, stripe, paymentIntent);
          break;
        }
        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          await handleGiftPaymentIntentFailed(supabase, stripe, paymentIntent);
          break;
        }
        case 'charge.dispute.created':
        case 'charge.dispute.updated':
        case 'charge.dispute.closed': {
          const dispute = event.data.object as Stripe.Dispute;
          await handleDisputeEvent(supabase, stripe, dispute, event.type, event.id);
          break;
        }
        case 'charge.refunded': {
          const charge = event.data.object as Stripe.Charge;
          await handleChargeRefunded(supabase, stripe, charge, event.id);
          break;
        }
        default:
          logStep('Unhandled event type', { type: event.type });
          outcome = 'skipped';
      }
    } catch (processingError) {
      outcome = 'error';
      errorMessage = (processingError as Error).message;
      logStep('Error processing event', { error: errorMessage });
    }

    const processedAt = new Date().toISOString();
    await supabase.from('stripe_events').update({ 
      processed_at: processedAt,
      outcome,
      error_message: errorMessage,
      last_error_at: outcome === 'error' ? processedAt : null,
      ...(replayAttempt ? { replay_status: outcome === 'error' ? 'failed' : 'replayed' } : {})
    }).eq('stripe_event_id', event.id);

    if (replayAttempt) {
      await supabase.from('stripe_event_replay_requests').update({
        status: outcome === 'error' ? 'failed' : 'succeeded',
        processed_at: processedAt,
        result_outcome: outcome,
        error_message: errorMessage,
      })
      .eq('stripe_event_id', event.id)
      .in('status', ['requested', 'processing']);
    }

    await supabase.from('payment_events').update({ 
      status: outcome === 'error' ? 'error' : 'processed', processed_at: processedAt
    }).eq('stripe_event_id', event.id);

    return new Response(JSON.stringify({ received: true, outcome }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const err = error as Error;
    const errorId = crypto.randomUUID();
    logStep('ERROR in stripe-webhook', { errorId, message: err.message });
    return new Response(
      JSON.stringify({ error: 'Webhook processing failed', errorId }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// ============================================================================
// HANDLER FUNCTIONS
// ============================================================================

const GRACE_PERIOD_DAYS = 7;
const PROTECTED_ACCOUNT_STATUSES = ['deletion_requested', 'scheduled_for_deletion', 'deleted'];

/**
 * Drive profiles.account_status from Stripe subscription status.
 * Never overrides user-initiated deletion states.
 */
async function applyAccountStatusFromStripe(
  supabase: any,
  userId: string,
  stripeStatus: string,
) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('account_status, payment_failed_at, grace_period_ends_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (!profile) {
    logStep('applyAccountStatus: no profile', { userId });
    return;
  }
  if (PROTECTED_ACCOUNT_STATUSES.includes(profile.account_status)) {
    logStep('applyAccountStatus: skipping protected status', { userId, status: profile.account_status });
    return;
  }

  const now = new Date();
  const update: Record<string, any> = { updated_at: now.toISOString() };

  if (stripeStatus === 'active' || stripeStatus === 'trialing') {
    update.account_status = 'active';
    update.payment_failed_at = null;
    update.grace_period_ends_at = null;
  } else if (stripeStatus === 'past_due') {
    const failedAt = profile.payment_failed_at ? new Date(profile.payment_failed_at) : now;
    const graceEnd = profile.grace_period_ends_at
      ? new Date(profile.grace_period_ends_at)
      : new Date(failedAt.getTime() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000);
    if (!profile.payment_failed_at) update.payment_failed_at = failedAt.toISOString();
    if (!profile.grace_period_ends_at) update.grace_period_ends_at = graceEnd.toISOString();
    update.account_status = now < graceEnd ? 'active' : 'expired_read_only';
  } else if (
    stripeStatus === 'unpaid' ||
    stripeStatus === 'incomplete_expired' ||
    stripeStatus === 'canceled'
  ) {
    update.account_status = 'expired_read_only';
  } else {
    return;
  }

  const { error } = await supabase.from('profiles').update(update).eq('user_id', userId);
  if (error) logStep('applyAccountStatus error', error);
  else logStep('applyAccountStatus', { userId, stripeStatus, applied: update });
}


async function handleSubscriptionChange(
  supabase: any, stripe: Stripe, subscription: Stripe.Subscription, eventType: string, sourceEventId: string
) {
  logStep('Handling subscription change', { subscriptionId: subscription.id, eventType, status: subscription.status });

  const customer = await getCustomerEmail(stripe, subscription.customer as string);
  if (!customer?.email) {
    logStep('No customer email found');
    return;
  }

  // Find user by email
  const { data: usersData } = await supabase.auth.admin.listUsers();
  const user = usersData?.users?.find((u: any) => u.email === customer.email);
  if (!user) {
    logStep('No user found for email', { email: customer.email });
    return;
  }

  // Parse subscription items by lookup_key
  const parsed = parseSubscriptionItems(subscription.items.data as Stripe.SubscriptionItem[]);
  logStep('Parsed subscription items', parsed);

  const stripeStatus = subscription.status;
  const currentPeriodEnd = subscription.current_period_end 
    ? new Date(subscription.current_period_end * 1000).toISOString() 
    : null;

  // Subscription ID guard: prevent stale webhooks from overwriting active entitlements
  const { data: existingEntitlement } = await supabase
    .from('entitlements')
    .select('stripe_subscription_id, status')
    .eq('user_id', user.id)
    .maybeSingle();

  if (existingEntitlement?.stripe_subscription_id && 
      existingEntitlement.stripe_subscription_id !== subscription.id) {
    // Different subscription - check if existing is still active in Stripe
    try {
      const existingSub = await stripe.subscriptions.retrieve(existingEntitlement.stripe_subscription_id);
      if (existingSub.status === 'active' || existingSub.status === 'trialing') {
        logStep('Skipping update - existing active subscription takes precedence', {
          existing: existingEntitlement.stripe_subscription_id,
          incoming: subscription.id
        });
        return;
      }
    } catch (_e) {
      // Existing subscription not found in Stripe, proceed with update
    }
  }

  // Prevent downgrade from active to incomplete
  let finalStatus = stripeStatus;
  if (existingEntitlement?.status === 'active' && (stripeStatus === 'incomplete' || stripeStatus === 'incomplete_expired')) {
    logStep('Keeping active status instead of downgrading to incomplete');
    finalStatus = 'active';
  }

  const isNewSubscription = !existingEntitlement?.stripe_subscription_id && (finalStatus === 'active' || finalStatus === 'trialing');

  // UPSERT entitlements with all new fields
  const { error: entitlementError } = await supabase
    .from('entitlements')
    .upsert({
      user_id: user.id,
      plan: parsed.plan,
      status: finalStatus === 'active' || finalStatus === 'trialing' ? 'active' : finalStatus === 'past_due' ? 'past_due' : finalStatus === 'canceled' || finalStatus === 'unpaid' ? 'canceled' : 'inactive',
      entitlement_source: 'stripe',
      stripe_customer_id: subscription.customer as string,
      stripe_subscription_id: subscription.id,
      stripe_plan_price_id: parsed.planPriceId,
      plan_lookup_key: parsed.planLookupKey,
      subscription_status: stripeStatus,
      cancel_at_period_end: subscription.cancel_at_period_end || false,
      base_storage_gb: parsed.baseStorageGb,
      storage_addon_blocks_qty: parsed.storageAddonBlocksQty,
      current_period_end: currentPeriodEnd,
      source_event_id: sourceEventId,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });

  if (entitlementError) {
    logStep('Error upserting entitlement', entitlementError);
  } else {
    logStep('Entitlement upserted successfully', { plan: parsed.plan, status: finalStatus });
    await applyAccountStatusFromStripe(supabase, user.id, stripeStatus);
  }


  // BACKWARDS COMPAT: Update profiles table
  const totalStorageGb = parsed.baseStorageGb + (parsed.storageAddonBlocksQty * 25);
  await supabase.from('profiles').update({
    stripe_customer_id: subscription.customer,
    plan_id: parsed.planPriceId || parsed.plan,
    plan_status: finalStatus,
    current_period_end: currentPeriodEnd,
    property_limit: 999999,
    storage_quota_gb: totalStorageGb,
    updated_at: new Date().toISOString()
  }).eq('user_id', user.id);

  // BACKWARDS COMPAT: Update subscribers table
  await supabase.from('subscribers').upsert({
    user_id: user.id,
    email: customer.email,
    stripe_customer_id: subscription.customer,
    subscribed: finalStatus === 'active' || finalStatus === 'trialing',
    subscription_tier: parsed.plan,
    subscription_end: currentPeriodEnd,
    updated_at: new Date().toISOString()
  }, { onConflict: 'user_id' });

  // Send welcome email for new subscriptions
  if (isNewSubscription) {
    try {
      await supabase.functions.invoke('send-subscription-welcome-email', {
        body: { email: customer.email, subscription_tier: parsed.plan }
      });
    } catch (error) {
      logStep('Failed to send welcome email', error);
    }
  }
}

async function handleSubscriptionDeleted(
  supabase: any, stripe: Stripe, subscription: Stripe.Subscription, sourceEventId: string
) {
  logStep('Handling subscription deletion', { subscriptionId: subscription.id });

  const customer = await getCustomerEmail(stripe, subscription.customer as string);
  let userId: string | null = null;
  
  if (customer?.email) {
    const { data: usersData } = await supabase.auth.admin.listUsers();
    const user = usersData?.users?.find((u: any) => u.email === customer.email);
    userId = user?.id;
  }

  if (userId) {
    // Only reset if this subscription matches the stored one
    const { data: entitlement } = await supabase
      .from('entitlements')
      .select('stripe_subscription_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (entitlement?.stripe_subscription_id && entitlement.stripe_subscription_id !== subscription.id) {
      logStep('Skipping deletion - subscription ID does not match active entitlement');
      return;
    }

    await supabase.from('entitlements').update({
      status: 'canceled',
      subscription_status: 'canceled',
      cancel_at_period_end: false,
      base_storage_gb: 0,
      storage_addon_blocks_qty: 0,
      current_period_end: new Date().toISOString(),
      source_event_id: sourceEventId,
      updated_at: new Date().toISOString()
    }).eq('user_id', userId);

    await applyAccountStatusFromStripe(supabase, userId, 'canceled');
  }


  // BACKWARDS COMPAT
  await supabase.from('profiles').update({
    plan_status: 'canceled',
    current_period_end: new Date().toISOString(),
    property_limit: 999999,
    storage_quota_gb: 0,
    updated_at: new Date().toISOString()
  }).eq('stripe_customer_id', subscription.customer);

  await supabase.from('subscribers').update({
    subscribed: false,
    subscription_end: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }).eq('stripe_customer_id', subscription.customer);
}

async function handlePaymentSucceeded(
  supabase: any, stripe: Stripe, invoice: Stripe.Invoice, sourceEventId: string
) {
  logStep('Handling payment success', { invoiceId: invoice.id });

  if (invoice.customer) {
    const user = await findUserForStripeCustomer(supabase, stripe, invoice.customer as string);
    if (user) {
      const { data: entitlement } = await supabase
        .from('entitlements')
        .select('status')
        .eq('user_id', user.id)
        .maybeSingle();

      if (entitlement && entitlement.status !== 'active') {
        await supabase.from('entitlements').update({
          status: 'active',
          subscription_status: 'active',
          source_event_id: sourceEventId,
          updated_at: new Date().toISOString()
        }).eq('user_id', user.id);
      }

      await supabase.from('profiles').update({
        plan_status: 'active',
        updated_at: new Date().toISOString()
      }).eq('user_id', user.id);

      await applyAccountStatusFromStripe(supabase, user.id, 'active');
    }
  }


  await supabase.from('subscribers').update({
    payment_failure_reminder_sent: false,
    payment_failure_reminder_sent_at: null,
    updated_at: new Date().toISOString()
  }).eq('stripe_customer_id', invoice.customer);
}

async function handlePaymentFailed(
  supabase: any, stripe: Stripe, invoice: Stripe.Invoice, sourceEventId: string
) {
  logStep('Handling payment failure', { invoiceId: invoice.id });

  if (invoice.customer) {
    const user = await findUserForStripeCustomer(supabase, stripe, invoice.customer as string);
    if (user) {
      await supabase.from('entitlements').update({
        status: 'past_due',
        subscription_status: 'past_due',
        source_event_id: sourceEventId,
        updated_at: new Date().toISOString()
      }).eq('user_id', user.id);

      await supabase.from('profiles').update({
        plan_status: 'past_due',
        updated_at: new Date().toISOString()
      }).eq('user_id', user.id);

      // Start (or update) the 7-day grace period - does NOT flip to read-only yet.
      await applyAccountStatusFromStripe(supabase, user.id, 'past_due');
    }
  }

  await supabase.from('subscribers').update({
    last_payment_failure_check: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }).eq('stripe_customer_id', invoice.customer);
}

async function updateGiftCheckoutFailureState(
  supabase: any,
  match: {
    sessionId?: string | null;
    giftId?: string | null;
    paymentIntentId?: string | null;
  },
  state: 'failed' | 'expired',
  reason: string,
) {
  let query = supabase
    .from('gift_subscriptions')
    .select('id,status,payment_status,stripe_session_id,stripe_payment_intent_id')
    .limit(1);

  if (match.giftId) {
    query = query.eq('id', match.giftId);
  } else if (match.sessionId) {
    query = query.eq('stripe_session_id', match.sessionId);
  } else if (match.paymentIntentId) {
    query = query.eq('stripe_payment_intent_id', match.paymentIntentId);
  } else {
    logStep('Gift failure update skipped: no gift lookup key', { state, reason });
    return;
  }

  const { data: rows, error: lookupErr } = await query;
  if (lookupErr) {
    logStep('ERROR looking up gift for failure update', lookupErr);
    throw new Error(`gift failure lookup failed: ${lookupErr.message}`);
  }
  if (!rows || rows.length === 0) {
    logStep('Gift failure update skipped: no matching gift row', { match, state, reason });
    return;
  }

  const gift = rows[0];
  if (gift.status === 'paid' || gift.payment_status === 'paid') {
    logStep('Gift failure update skipped: gift already paid', { giftId: gift.id, state, reason });
    return;
  }

  const update: Record<string, any> = {
    status: state,
    payment_status: state,
    delivery_status: 'not_sent',
    failed_at: new Date().toISOString(),
    failure_reason: reason,
    updated_at: new Date().toISOString(),
  };
  if (match.paymentIntentId && !gift.stripe_payment_intent_id) {
    update.stripe_payment_intent_id = match.paymentIntentId;
  }

  const { data: updated, error: updateErr } = await supabase
    .from('gift_subscriptions')
    .update(update)
    .eq('id', gift.id)
    .neq('status', 'paid')
    .neq('payment_status', 'paid')
    .select('id,status,payment_status');

  if (updateErr) {
    logStep('ERROR updating gift failure state', updateErr);
    throw new Error(`gift failure update failed: ${updateErr.message}`);
  }

  logStep('Gift failure state updated', {
    giftId: gift.id,
    state,
    reason,
    updatedCount: updated?.length ?? 0,
  });
}

async function handleGiftCheckoutFailed(
  supabase: any,
  session: Stripe.Checkout.Session,
  reason: string,
) {
  if (session.metadata?.gift !== 'true') return;

  await updateGiftCheckoutFailureState(
    supabase,
    {
      sessionId: session.id,
      giftId: session.metadata?.gift_subscription_id ?? null,
      paymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : null,
    },
    'failed',
    reason,
  );
}

async function handleGiftCheckoutExpired(
  supabase: any,
  session: Stripe.Checkout.Session,
) {
  if (session.metadata?.gift !== 'true') return;

  await updateGiftCheckoutFailureState(
    supabase,
    {
      sessionId: session.id,
      giftId: session.metadata?.gift_subscription_id ?? null,
      paymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : null,
    },
    'expired',
    'checkout.session.expired',
  );
}

async function handleGiftPaymentIntentFailed(
  supabase: any,
  stripe: Stripe,
  paymentIntent: Stripe.PaymentIntent,
) {
  let session: Stripe.Checkout.Session | null = null;
  if (paymentIntent.metadata?.gift !== 'true') {
    try {
      const sessions = await stripe.checkout.sessions.list({
        payment_intent: paymentIntent.id,
        limit: 1,
      } as any);
      session = sessions.data[0] ?? null;
    } catch (err) {
      logStep('Unable to look up checkout session for failed payment intent', {
        paymentIntentId: paymentIntent.id,
        error: (err as Error).message,
      });
    }
  }

  const giftMetadata = paymentIntent.metadata?.gift === 'true' || session?.metadata?.gift === 'true';
  if (!giftMetadata) return;

  await updateGiftCheckoutFailureState(
    supabase,
    {
      sessionId: session?.id ?? null,
      giftId: paymentIntent.metadata?.gift_subscription_id ?? session?.metadata?.gift_subscription_id ?? null,
      paymentIntentId: paymentIntent.id,
    },
    'failed',
    paymentIntent.last_payment_error?.code
      ? `payment_intent.payment_failed:${paymentIntent.last_payment_error.code}`
      : 'payment_intent.payment_failed',
  );
}

async function handleCheckoutCompleted(
  supabase: any, stripe: Stripe, session: Stripe.Checkout.Session, sourceEventId: string
) {
  logStep('Handling checkout completion', { sessionId: session.id, mode: session.mode, metadata: session.metadata });

  // ── GIFT FLOW (v5: webhook is fulfillment authority, single-writer email) ─
  if (session.metadata?.gift === "true" && (session.mode === 'payment' || session.mode === 'subscription')) {
    logStep('Gift checkout completed — fulfillment', { sessionId: session.id, mode: session.mode });
    try {
      // Look up the pre-created gift row (created by create-gift-checkout)
      const { data: rows, error: lookupErr } = await supabase
        .from('gift_subscriptions')
        .select('*')
        .eq('stripe_session_id', session.id)
        .limit(1);
      if (lookupErr) {
        logStep('ERROR looking up gift row', lookupErr);
        throw new Error(`gift lookup failed: ${lookupErr.message}`);
      }
      if (!rows || rows.length === 0) {
        logStep('WARN: no gift row for session — create-gift-checkout did not pre-insert. Skipping.', { sessionId: session.id });
        return;
      }
      const gift = rows[0];
      const deliveryMethod = gift.delivery_method || session.metadata?.gift_delivery_method || 'recipient_email';
      const isPurchaserCodeGift = deliveryMethod === 'purchaser_code';

      const giftTerm = session.metadata.gift_term || gift.term || 'yearly';
      const now = new Date();
      const expiresAt = gift.expires_at
        ? new Date(gift.expires_at)
        : (() => {
          const e = new Date(now);
          if (giftTerm === 'monthly') e.setMonth(e.getMonth() + 1);
          else e.setFullYear(e.getFullYear() + 1);
          return e;
        })();

      // Ensure no auto-renew on subscription gifts
      if (session.mode === 'subscription' && session.subscription) {
        try {
          await stripe.subscriptions.update(session.subscription as string, { cancel_at_period_end: true });
        } catch (subErr) {
          logStep('ERROR: could not set cancel_at_period_end', { error: (subErr as Error).message });
        }
      }

      // 1. Mark paid (idempotent — only if not already paid)
      const { error: payUpdErr } = await supabase
        .from('gift_subscriptions')
        .update({
          payment_status: 'paid',
          status: gift.status === 'pending'
            ? (isPurchaserCodeGift ? 'active_unclaimed' : 'paid')
            : gift.status,
          paid_at: gift.paid_at ?? new Date().toISOString(),
          stripe_payment_intent_id: (session.payment_intent as string) ?? gift.stripe_payment_intent_id,
          stripe_subscription_id: session.mode === 'subscription'
            ? (session.subscription as string)
            : gift.stripe_subscription_id,
          expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', gift.id);
      if (payUpdErr) {
        logStep('ERROR marking gift paid', payUpdErr);
        throw new Error(`gift paid update failed: ${payUpdErr.message}`);
      }

      const deliveryDate = gift.delivery_date ? new Date(gift.delivery_date) : now;
      if (!isPurchaserCodeGift && deliveryDate.getTime() > Date.now()) {
        logStep('Gift paid; delivery scheduled for future date', {
          giftId: gift.id,
          deliveryDate: deliveryDate.toISOString(),
        });
        return;
      }

      // 2. Acquire sending lock with stuck-recovery guard (10 min)
      const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const newClaimToken = (() => {
        const bytes = crypto.getRandomValues(new Uint8Array(32));
        return btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
      })();
      const newHashBuf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(newClaimToken));
      const newHash = Array.from(new Uint8Array(newHashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');

      // Eligible if not_sent/failed, or sending+stale
      const { data: locked, error: lockErr } = await supabase
        .from('gift_subscriptions')
        .update({
          delivery_status: 'sending',
          delivery_attempted_at: new Date().toISOString(),
          claim_token_hash: newHash,
          updated_at: new Date().toISOString(),
        })
        .eq('id', gift.id)
        .or(`delivery_status.in.(not_sent,failed),and(delivery_status.eq.sending,delivery_attempted_at.lt.${tenMinAgo})`)
        .select('id');

      if (lockErr) {
        logStep('ERROR acquiring sending lock', lockErr);
        return;
      }
      if (!locked || locked.length === 0) {
        // Already sending recently or already sent — idempotent skip
        logStep('Gift email already in progress or sent — skipping', { giftId: gift.id });
        return;
      }

      // 3. Invoke send-gift-email via internal secret
      const internalSecret = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const sendUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-gift-email`;
      const res = await fetch(sendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-secret': internalSecret,
          'Authorization': `Bearer ${internalSecret}`,
        },
        body: JSON.stringify({ giftId: gift.id, claimToken: newClaimToken }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        logStep('ERROR: send-gift-email returned non-2xx', { status: res.status, body: text });
      } else {
        logStep('Gift email dispatched', { giftId: gift.id });
      }
    } catch (giftError) {
      logStep('Error in gift flow', { error: (giftError as Error).message });
    }
    return; // Skip regular subscription processing for gifts
  }

  // Legacy: Handle old gift_subscriptions flow
  if (session.metadata?.gift_code) {
    await supabase.from('gift_subscriptions').update({ status: 'paid' }).eq('gift_code', session.metadata.gift_code);
  }

  // Handle regular subscription checkout via shared fulfillment routine.
  // The shared module is the single source of truth for user creation,
  // workspace setup, entitlements, consent, and the magic-link email.
  if (session.mode === 'subscription' && session.subscription) {
    try {
      const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['customer', 'subscription', 'subscription.items.data.price', 'customer_details'],
      });
      const result = await fulfillCheckout(stripe, supabase, fullSession, {
        source: 'stripe-webhook',
        sourceEventId,
        origin: 'https://getassetsafe.com',
      });
      logStep('Shared fulfillCheckout result', result);
    } catch (err) {
      logStep('Shared fulfillCheckout threw', { error: (err as Error).message });
      throw err;
    }
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function getCustomerEmail(stripe: Stripe, customerId: string): Promise<Stripe.Customer | null> {
  try {
    return await stripe.customers.retrieve(customerId) as Stripe.Customer;
  } catch (error) {
    logStep('Error retrieving customer', error);
    return null;
  }
}

async function findUserForStripeCustomer(
  supabase: any,
  stripe: Stripe,
  customerId: string,
): Promise<{ id: string; email?: string } | null> {
  const { data: entitlement } = await supabase
    .from('entitlements')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .limit(1)
    .maybeSingle();
  if (entitlement?.user_id) return { id: entitlement.user_id };

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .limit(1)
    .maybeSingle();
  if (profile?.user_id) return { id: profile.user_id };

  const customer = await getCustomerEmail(stripe, customerId);
  if (!customer?.email) {
    logStep('No user found for Stripe customer', { customerId });
    return null;
  }

  const { data: usersData } = await supabase.auth.admin.listUsers();
  const user = usersData?.users?.find((u: any) => u.email === customer.email);
  if (!user) {
    logStep('No user found for Stripe customer email', { customerId, email: customer.email });
    return null;
  }

  return { id: user.id, email: user.email };
}

async function handleDisputeEvent(
  supabase: any,
  stripe: Stripe,
  dispute: Stripe.Dispute,
  eventType: string,
  sourceEventId: string,
) {
  logStep('Handling Stripe dispute event', { disputeId: dispute.id, eventType, status: dispute.status });
  const disputeAny = dispute as any;

  let charge: Stripe.Charge | null = null;
  if (typeof dispute.charge === 'string') {
    try {
      charge = await stripe.charges.retrieve(dispute.charge);
    } catch (error) {
      logStep('Unable to retrieve dispute charge', { disputeId: dispute.id, chargeId: dispute.charge, error: (error as Error).message });
    }
  } else if (dispute.charge) {
    charge = dispute.charge as Stripe.Charge;
  }

  const stripeCustomerId = typeof charge?.customer === 'string'
    ? charge.customer
    : typeof disputeAny.payment_intent === 'string'
      ? null
      : null;
  const customer = stripeCustomerId ? await getCustomerEmail(stripe, stripeCustomerId) : null;
  const user = stripeCustomerId ? await findUserForStripeCustomer(supabase, stripe, stripeCustomerId) : null;
  const customerEmail = customer?.email || user?.email || charge?.billing_details?.email || null;
  const evidenceDueBy = dispute.evidence_details?.due_by
    ? new Date(dispute.evidence_details.due_by * 1000).toISOString()
    : null;
  const isClosed = eventType === 'charge.dispute.closed' || ['won', 'lost', 'warning_closed'].includes(dispute.status);
  const outcome = isClosed ? dispute.status : null;
  const openedAt = dispute.created ? new Date(dispute.created * 1000).toISOString() : new Date().toISOString();
  const closedAt = isClosed ? new Date().toISOString() : null;
  const supportPriority = isClosed && dispute.status === 'lost' ? 'critical' : 'high';

  const { data: existingReview } = await supabase
    .from('stripe_dispute_reviews')
    .select('id, support_issue_id')
    .eq('stripe_dispute_id', dispute.id)
    .maybeSingle();

  let supportIssueId = existingReview?.support_issue_id || null;
  const issueTitle = isClosed
    ? `Stripe dispute closed: ${dispute.id} (${dispute.status})`
    : `Stripe dispute opened: ${dispute.id}`;
  const issueDescription = [
    `Stripe event: ${eventType}`,
    `Dispute ID: ${dispute.id}`,
    `Charge ID: ${typeof dispute.charge === 'string' ? dispute.charge : charge?.id || '-'}`,
    `Payment intent: ${typeof disputeAny.payment_intent === 'string' ? disputeAny.payment_intent : '-'}`,
    `Customer ID: ${stripeCustomerId || '-'}`,
    `User ID: ${user?.id || '-'}`,
    `Amount: ${dispute.amount ?? '-'} ${dispute.currency || ''}`,
    `Reason: ${dispute.reason || '-'}`,
    `Status: ${dispute.status || '-'}`,
    `Evidence due: ${evidenceDueBy || '-'}`,
    `Access action: review_required`,
  ].join('\n');

  if (supportIssueId) {
    const { error: issueUpdateError } = await supabase
      .from('dev_support_issues')
      .update({
        title: issueTitle,
        description: issueDescription,
        priority: supportPriority,
        status: isClosed ? 'investigating' : 'new',
        support_tier: 'priority',
        escalation_reason: 'Stripe dispute requires billing review',
      })
      .eq('id', supportIssueId);
    if (issueUpdateError) logStep('Unable to update dispute support issue', issueUpdateError);
  } else {
    const { data: issue, error: issueInsertError } = await supabase
      .from('dev_support_issues')
      .insert({
        title: issueTitle,
        description: issueDescription,
        reported_by: customerEmail || stripeCustomerId || dispute.id,
        type: 'billing_review',
        priority: supportPriority,
        status: 'new',
        support_tier: 'priority',
        escalation_reason: 'Stripe dispute requires billing review',
      })
      .select('id')
      .maybeSingle();
    if (issueInsertError) logStep('Unable to create dispute support issue', issueInsertError);
    supportIssueId = issue?.id || null;
  }

  const reviewPayload = {
    stripe_dispute_id: dispute.id,
    stripe_charge_id: typeof dispute.charge === 'string' ? dispute.charge : charge?.id || null,
    stripe_payment_intent_id: typeof disputeAny.payment_intent === 'string' ? disputeAny.payment_intent : null,
    stripe_customer_id: stripeCustomerId,
    user_id: user?.id || null,
    customer_email: customerEmail,
    amount: dispute.amount || null,
    currency: dispute.currency || null,
    reason: dispute.reason || null,
    status: dispute.status || null,
    outcome,
    evidence_due_by: evidenceDueBy,
    opened_at: openedAt,
    closed_at: closedAt,
    access_action_status: 'review_required',
    support_issue_id: supportIssueId,
    latest_event_id: sourceEventId,
    raw_payload: dispute as any,
  };

  const { error: reviewError } = await supabase
    .from('stripe_dispute_reviews')
    .upsert(reviewPayload, { onConflict: 'stripe_dispute_id' });

  if (reviewError) {
    logStep('Unable to upsert stripe dispute review', reviewError);
    throw reviewError;
  }

  logStep('Stripe dispute review recorded', { disputeId: dispute.id, supportIssueId });
}

async function handleChargeRefunded(
  supabase: any,
  stripe: Stripe,
  charge: Stripe.Charge,
  sourceEventId: string,
) {
  logStep('Handling Stripe charge refunded', { chargeId: charge.id });

  const refunds = charge.refunds?.data || [];
  const refund = refunds.length > 0
    ? refunds.reduce((latest: Stripe.Refund, current: Stripe.Refund) =>
        (current.created || 0) > (latest.created || 0) ? current : latest,
      )
    : null;

  if (!refund) {
    logStep('charge.refunded did not include refund details', { chargeId: charge.id });
    return;
  }

  const stripeCustomerId = typeof charge.customer === 'string' ? charge.customer : null;
  const customer = stripeCustomerId ? await getCustomerEmail(stripe, stripeCustomerId) : null;
  const user = stripeCustomerId ? await findUserForStripeCustomer(supabase, stripe, stripeCustomerId) : null;
  const customerEmail = customer?.email || user?.email || charge.billing_details?.email || null;
  const paymentIntentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : null;
  const isFailed = refund.status === 'failed' || refund.status === 'canceled';
  const supportPriority = isFailed ? 'high' : 'medium';

  const { data: existingReview } = await supabase
    .from('stripe_refund_reviews')
    .select('id, support_issue_id')
    .eq('stripe_refund_id', refund.id)
    .maybeSingle();

  let supportIssueId = existingReview?.support_issue_id || null;
  const issueTitle = `Stripe refund recorded: ${refund.id} (${refund.status || 'unknown'})`;
  const issueDescription = [
    `Stripe event: charge.refunded`,
    `Refund ID: ${refund.id}`,
    `Charge ID: ${charge.id}`,
    `Payment intent: ${paymentIntentId || '-'}`,
    `Customer ID: ${stripeCustomerId || '-'}`,
    `User ID: ${user?.id || '-'}`,
    `Amount: ${refund.amount ?? charge.amount_refunded ?? '-'} ${refund.currency || charge.currency || ''}`,
    `Reason: ${refund.reason || '-'}`,
    `Status: ${refund.status || '-'}`,
    `Access action: review_required`,
  ].join('\n');

  if (supportIssueId) {
    const { error: issueUpdateError } = await supabase
      .from('dev_support_issues')
      .update({
        title: issueTitle,
        description: issueDescription,
        priority: supportPriority,
        status: isFailed ? 'investigating' : 'new',
        support_tier: 'priority',
        escalation_reason: 'Stripe refund requires billing evidence review',
      })
      .eq('id', supportIssueId);
    if (issueUpdateError) logStep('Unable to update refund support issue', issueUpdateError);
  } else {
    const { data: issue, error: issueInsertError } = await supabase
      .from('dev_support_issues')
      .insert({
        title: issueTitle,
        description: issueDescription,
        reported_by: customerEmail || stripeCustomerId || refund.id,
        type: 'billing_review',
        priority: supportPriority,
        status: 'new',
        support_tier: 'priority',
        escalation_reason: 'Stripe refund requires billing evidence review',
      })
      .select('id')
      .maybeSingle();
    if (issueInsertError) logStep('Unable to create refund support issue', issueInsertError);
    supportIssueId = issue?.id || null;
  }

  const { error: reviewError } = await supabase
    .from('stripe_refund_reviews')
    .upsert({
      stripe_refund_id: refund.id,
      stripe_charge_id: charge.id,
      stripe_payment_intent_id: paymentIntentId,
      stripe_customer_id: stripeCustomerId,
      user_id: user?.id || null,
      customer_email: customerEmail,
      amount: refund.amount || charge.amount_refunded || null,
      currency: refund.currency || charge.currency || null,
      reason: refund.reason || null,
      status: refund.status || null,
      outcome: isFailed ? 'failed' : 'recorded',
      manual_review_status: 'needs_review',
      access_action_status: 'review_required',
      support_issue_id: supportIssueId,
      latest_event_id: sourceEventId,
      raw_payload: { charge, refund } as any,
    }, { onConflict: 'stripe_refund_id' });

  if (reviewError) {
    logStep('Unable to upsert stripe refund review', reviewError);
    throw reviewError;
  }

  logStep('Stripe refund review recorded', { refundId: refund.id, chargeId: charge.id, supportIssueId });
}

async function sendPaymentReceipt(supabase: any, session: Stripe.Checkout.Session) {
  try {
    const customerEmail = session.customer_details?.email || session.customer_email;
    const customerName = session.customer_details?.name || 'Customer';
    if (!customerEmail) return;

    await supabase.functions.invoke('send-payment-receipt-internal', {
      body: {
        customerEmail, customerName,
        amount: session.amount_total || 0,
        currency: session.currency || 'usd',
        transactionId: session.id,
        planType: session.metadata?.plan_lookup_key || session.metadata?.plan_type || 'standard'
      }
    });
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
        customerEmail, customerName,
        amount: paymentIntent.amount || 0,
        currency: paymentIntent.currency || 'usd',
        transactionId: paymentIntent.id,
        planType: 'subscription'
      }
    });
  } catch (error) {
    logStep('Failed to trigger payment receipt from intent', error);
  }
}
