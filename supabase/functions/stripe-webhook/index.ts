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
      // Base plan item
      planLookupKey = lookupKey;
      planPriceId = item.price.id;
      if (lookupKey.startsWith('premium_')) {
        plan = 'premium';
        baseStorageGb = 100;
      } else {
        plan = 'standard';
        baseStorageGb = 25;
      }
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

    // IDEMPOTENCY CHECK
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

    await supabase.from('stripe_events').upsert({
      stripe_event_id: event.id,
      event_type: event.type,
      payload: event.data,
      outcome: 'received'
    }, { onConflict: 'stripe_event_id' });

    logStep('Processing event', { type: event.type, id: event.id });

    // Log to payment_events for audit trail
    const eventObject = event.data.object as any;
    const customerId = eventObject.customer || eventObject.customer_id || null;
    const subscriptionId = eventObject.subscription || eventObject.id || null;
    let amount: number | null = eventObject.amount_total || eventObject.amount_paid || eventObject.amount || eventObject.plan?.amount || null;
    
    await supabase.from('payment_events').insert({
      stripe_event_id: event.id,
      event_type: event.type,
      event_data: event.data,
      status: 'received',
      customer_id: customerId,
      subscription_id: typeof subscriptionId === 'string' ? subscriptionId : null,
      amount: amount,
      currency: eventObject.currency || 'usd'
    });

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

    await supabase.from('stripe_events').update({ 
      processed_at: new Date().toISOString(), outcome 
    }).eq('stripe_event_id', event.id);

    await supabase.from('payment_events').update({ 
      status: 'processed', processed_at: new Date().toISOString() 
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
    const customer = await getCustomerEmail(stripe, invoice.customer as string);
    if (customer?.email) {
      const { data: usersData } = await supabase.auth.admin.listUsers();
      const user = usersData?.users?.find((u: any) => u.email === customer.email);
      
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
      }
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
    const customer = await getCustomerEmail(stripe, invoice.customer as string);
    if (customer?.email) {
      const { data: usersData } = await supabase.auth.admin.listUsers();
      const user = usersData?.users?.find((u: any) => u.email === customer.email);
      
      if (user) {
        await supabase.from('entitlements').update({
          status: 'past_due',
          subscription_status: 'past_due',
          source_event_id: sourceEventId,
          updated_at: new Date().toISOString()
        }).eq('user_id', user.id);
      }
    }
  }

  await supabase.from('profiles').update({
    plan_status: 'past_due',
    updated_at: new Date().toISOString()
  }).eq('stripe_customer_id', invoice.customer);

  await supabase.from('subscribers').update({
    last_payment_failure_check: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }).eq('stripe_customer_id', invoice.customer);
}

async function handleCheckoutCompleted(
  supabase: any, stripe: Stripe, session: Stripe.Checkout.Session, sourceEventId: string
) {
  logStep('Handling checkout completion', { sessionId: session.id, mode: session.mode, metadata: session.metadata });

  // ── GIFT FLOW ──────────────────────────────────────────────────────────────
  if (session.metadata?.gift === "true" && (session.mode === 'payment' || session.mode === 'subscription')) {
    logStep('Gift checkout completed, processing unified gift flow', { mode: session.mode });
    try {
      // Generate GIFT-XXXXXXXXXX code
      const randomPart = Array.from(crypto.getRandomValues(new Uint8Array(5)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase();
      const giftCode = `GIFT-${randomPart}`;
      const giftTerm = session.metadata.gift_term || 'yearly';
      const now = new Date();
      const expiresAt = new Date(now);
      if (giftTerm === 'monthly') {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      } else {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      }

      // For subscription mode: immediately cancel auto-renew
      if (session.mode === 'subscription' && session.subscription) {
        try {
          await stripe.subscriptions.update(session.subscription as string, {
            cancel_at_period_end: true,
          });
          logStep('Subscription set to cancel_at_period_end', { subscriptionId: session.subscription });
        } catch (subErr) {
          logStep('ERROR: CRITICAL — could not set cancel_at_period_end on gift subscription. This subscription may auto-renew. Manual review required.', { subscriptionId: session.subscription, error: (subErr as Error).message });
        }
      }

      // Insert into gift_subscriptions (unified system)
      const recipientName = session.metadata.recipient_name || null;
      const purchaserName = session.metadata.from_name;
      const { error: giftInsertError } = await supabase.from('gift_subscriptions').insert({
        gift_code: giftCode,
        recipient_email: session.metadata.recipient_email,
        recipient_name: recipientName,
        purchaser_name: purchaserName,
        purchaser_email: session.metadata.purchaser_email || session.customer_details?.email || null,
        gift_message: session.metadata.gift_message || null,
        plan_type: 'standard',
        term: giftTerm,
        delivery_date: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        stripe_checkout_session_id: session.id,
        stripe_subscription_id: session.mode === 'subscription' ? session.subscription as string : null,
        status: 'paid',
        amount: session.amount_total || 18900,
        currency: session.currency || 'usd',
        redeemed: false,
      });

      if (giftInsertError) {
        // Classify errors: duplicate key (23505) is idempotent — treat as success
        const pgCode = (giftInsertError as any)?.code;
        if (pgCode === '23505') {
          logStep('Warning: gift_subscriptions insert skipped — duplicate record already exists (idempotent)', { sessionId: session.id });
        } else {
          // All other errors: log at ERROR level and re-throw so Stripe retries
          logStep('ERROR: gift_subscriptions insert failed — will NOT fall back to legacy table. Stripe will retry.', { sessionId: session.id, error: giftInsertError.message, code: pgCode });
          throw new Error(`gift_subscriptions insert failed: ${giftInsertError.message}`);
        }
      } else {
        logStep('Gift record created in gift_subscriptions', { giftCode, expiresAt: expiresAt.toISOString() });
      }

      // Send recipient email with claim link + code
      const claimUrl = `https://www.getassetsafe.com/gift-claim?code=${giftCode}`;
      const resendKey = Deno.env.get('RESEND_API_KEY');
      const greeting = session.metadata.recipient_name
        ? `Hi ${session.metadata.recipient_name},`
        : "Hello,";
      if (resendKey) {
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Asset Safe <no-reply@getassetsafe.com>',
              to: [session.metadata.recipient_email],
              subject: "You've been gifted full access to Asset Safe 🎁",
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
                  <h2 style="color: #1a1a1a;">${greeting} You've received a gift! 🎁</h2>
                  <p><strong>${session.metadata.from_name}</strong> has gifted you a full year of access to Asset Safe — the secure home documentation platform.</p>
                  ${session.metadata.gift_message ? `<blockquote style="border-left: 3px solid #f97316; padding-left: 16px; color: #555; margin: 16px 0;">${session.metadata.gift_message}</blockquote>` : ''}
                  <p>Your access includes everything: unlimited properties, 25GB storage, Legacy Locker, Vault, and more.</p>
                  <p><strong>Access expires:</strong> ${expiresAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <div style="text-align: center; margin: 32px 0;">
                    <a href="${claimUrl}" style="background: #f97316; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Claim Your Gift Now</a>
                  </div>
                  <p style="color: #555; font-size: 14px;">Or use your gift code manually: <strong>${giftCode}</strong></p>
                  <p style="color: #888; font-size: 12px;">No auto-renew. After your gift expires, you can choose to subscribe monthly or yearly.</p>
                </div>
              `,
            }),
          });
          logStep('Recipient gift email sent with claim link');
        } catch (emailError) {
          logStep('Failed to send recipient email', emailError);
        }

        // Send gifter confirmation email
        try {
          const gifterEmail = session.metadata.purchaser_email || session.customer_details?.email;
          if (gifterEmail) {
            await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${resendKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: 'Asset Safe <no-reply@getassetsafe.com>',
                to: [gifterEmail],
                subject: "Your Asset Safe gift was delivered",
                html: `
                  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1a1a1a;">Your gift is on its way! 🎉</h2>
                    <p>Your gift to <strong>${session.metadata.recipient_email}</strong> has been processed and the redemption link has been delivered.</p>
                    ${session.metadata.gift_message ? `<p><strong>Your message:</strong> "${session.metadata.gift_message}"</p>` : ''}
                    <p><strong>Access period:</strong> 1 year (expires ${expiresAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })})</p>
                    <p>Thank you for sharing Asset Safe with someone you care about.</p>
                  </div>
                `,
              }),
            });
            logStep('Gifter confirmation email sent');
          }
        } catch (emailError) {
          logStep('Failed to send gifter confirmation email', emailError);
        }
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

  // Handle regular subscription checkout
  if (session.mode === 'subscription' && session.subscription) {
    // Retrieve the full subscription to parse items by lookup_key
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string, {
      expand: ['items.data.price']
    });

    const customerEmail = session.customer_details?.email || session.customer_email;
    if (!customerEmail) {
      logStep('No customer email found in checkout session');
      return;
    }

    const { data: usersData } = await supabase.auth.admin.listUsers();
    const user = usersData?.users?.find((u: any) => u.email === customerEmail);
    
    if (user) {
      const parsed = parseSubscriptionItems(subscription.items.data as Stripe.SubscriptionItem[]);
      const currentPeriodEnd = subscription.current_period_end 
        ? new Date(subscription.current_period_end * 1000).toISOString() 
        : null;

      // UPSERT entitlement with full Stripe data
      await supabase.from('entitlements').upsert({
        user_id: user.id,
        plan: parsed.plan,
        status: 'active',
        entitlement_source: 'stripe',
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: subscription.id,
        stripe_plan_price_id: parsed.planPriceId,
        plan_lookup_key: parsed.planLookupKey,
        subscription_status: subscription.status,
        cancel_at_period_end: subscription.cancel_at_period_end || false,
        base_storage_gb: parsed.baseStorageGb,
        storage_addon_blocks_qty: parsed.storageAddonBlocksQty,
        current_period_end: currentPeriodEnd,
        source_event_id: sourceEventId,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

      logStep('Entitlement activated from checkout', { userId: user.id, plan: parsed.plan });

      // BACKWARDS COMPAT
      const totalStorageGb = parsed.baseStorageGb + (parsed.storageAddonBlocksQty * 25);
      await supabase.from('profiles').update({
        stripe_customer_id: session.customer,
        plan_id: parsed.plan,
        plan_status: 'active',
        property_limit: 999999,
        storage_quota_gb: totalStorageGb,
        updated_at: new Date().toISOString()
      }).eq('user_id', user.id);

      await supabase.from('subscribers').upsert({
        user_id: user.id,
        email: customerEmail,
        stripe_customer_id: session.customer,
        subscribed: true,
        subscription_tier: parsed.plan,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

      // Send welcome email
      try {
        await supabase.functions.invoke('send-subscription-welcome-email', {
          body: { email: customerEmail, subscription_tier: parsed.plan }
        });
      } catch (error) {
        logStep('Failed to send welcome email', error);
      }
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
