import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { requireStepUp, getClientIp } from "../_shared/mfa.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (s: string, d?: any) => console.log(`[CANCEL-SUB] ${s}${d ? ' ' + JSON.stringify(d) : ''}`);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });

const cancelableStatuses = new Set(["active", "trialing", "past_due"]);

const periodEndIso = (subscription: Stripe.Subscription) =>
  subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : null;

const entitlementStatusFor = (stripeStatus: string) => {
  if (stripeStatus === "active" || stripeStatus === "trialing") return "active";
  if (stripeStatus === "past_due") return "past_due";
  if (stripeStatus === "canceled" || stripeStatus === "unpaid") return "canceled";
  return "inactive";
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
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

    const body = await req.json().catch(() => ({}));
    const { action, reason, comments } = body || {};
    log("Action", { action, userId: user.id });

    // Billing actions are sensitive — require an active MFA step-up (5 min)
    // if the user has MFA enrolled. No-op for users without MFA.
    const gate = await requireStepUp(supabaseClient, user.id, {
      kind: `cancel_subscription_${action ?? 'unknown'}`,
      ip: getClientIp(req),
      corsHeaders,
    });
    if (!gate.ok) return gate.response;


    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    const { data: entitlement } = await supabaseClient
      .from('entitlements')
      .select('stripe_customer_id, stripe_subscription_id, cancel_at_period_end, current_period_end, status')
      .eq('user_id', user.id)
      .maybeSingle();

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('stripe_customer_id, plan_status, current_period_end')
      .eq('user_id', user.id)
      .maybeSingle();

    const knownCustomerIds = [
      entitlement?.stripe_customer_id,
      profile?.stripe_customer_id,
    ].filter((id, index, ids): id is string => !!id && ids.indexOf(id) === index);

    const subscriptionCustomerId = (subscription: Stripe.Subscription): string | null => {
      if (typeof subscription.customer === 'string') return subscription.customer;
      return subscription.customer?.id ?? null;
    };

    const belongsToKnownCustomer = (subscription: Stripe.Subscription) => {
      const customerId = subscriptionCustomerId(subscription);
      return knownCustomerIds.length === 0 || (customerId ? knownCustomerIds.includes(customerId) : false);
    };

    const retrieveKnownSubscription = async (subscriptionId?: string | null) => {
      if (!subscriptionId) return null;
      try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        if (belongsToKnownCustomer(subscription)) return subscription;
        log("Stored subscription customer mismatch", {
          subscriptionId,
          subscriptionCustomerId: subscriptionCustomerId(subscription),
          knownCustomerIds,
        });
      } catch (e) {
        log("Stored subscription lookup failed", { subscriptionId, message: e instanceof Error ? e.message : String(e) });
      }
      return null;
    };

    const listSubscriptionsForCustomer = async (customerId: string) => {
      const all = await stripe.subscriptions.list({ customer: customerId, limit: 10 });
      return all.data;
    };

    const findSubscription = async (mode: 'cancel' | 'reactivate') => {
      const stored = await retrieveKnownSubscription(entitlement?.stripe_subscription_id);
      if (stored) {
        if (mode === 'reactivate' && stored.cancel_at_period_end) return stored;
        if (mode === 'cancel' && (cancelableStatuses.has(stored.status) || stored.cancel_at_period_end)) return stored;
      }

      for (const customerId of knownCustomerIds) {
        const subscriptions = await listSubscriptionsForCustomer(customerId);
        const match = mode === 'reactivate'
          ? subscriptions.find((s) => s.cancel_at_period_end === true)
          : subscriptions.find((s) => cancelableStatuses.has(s.status) || s.cancel_at_period_end === true);
        if (match) return match;
      }

      const customers = await stripe.customers.list({ email: user.email, limit: 10 });
      for (const customer of customers.data) {
        const subscriptions = await listSubscriptionsForCustomer(customer.id);
        const match = mode === 'reactivate'
          ? subscriptions.find((s) => s.cancel_at_period_end === true)
          : subscriptions.find((s) => cancelableStatuses.has(s.status) || s.cancel_at_period_end === true);
        if (match) return match;
      }

      return null;
    };

    const recordLocalCancellationState = async (subscription: Stripe.Subscription) => {
      const currentPeriodEnd = periodEndIso(subscription);
      const customerId = subscriptionCustomerId(subscription);

      await supabaseClient
        .from('entitlements')
        .update({
          status: entitlementStatusFor(subscription.status),
          subscription_status: subscription.status,
          cancel_at_period_end: true,
          current_period_end: currentPeriodEnd,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      await supabaseClient
        .from('profiles')
        .update({
          stripe_customer_id: customerId,
          plan_status: 'canceling',
          account_status: 'cancelled_billing_active',
          current_period_end: currentPeriodEnd,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      return currentPeriodEnd;
    };

    const recordLocalReactivationState = async (subscription: Stripe.Subscription) => {
      const currentPeriodEnd = periodEndIso(subscription);
      const customerId = subscriptionCustomerId(subscription);

      await supabaseClient
        .from('entitlements')
        .update({
          status: entitlementStatusFor(subscription.status),
          subscription_status: subscription.status,
          cancel_at_period_end: false,
          current_period_end: currentPeriodEnd,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      await supabaseClient
        .from('profiles')
        .update({
          stripe_customer_id: customerId,
          plan_status: entitlementStatusFor(subscription.status),
          account_status: 'active',
          cancellation_notice_sent_at: null,
          current_period_end: currentPeriodEnd,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);
    };

    if (action === 'cancel') {
      const subscription = await findSubscription('cancel');
      if (!subscription) {
        if (entitlement?.cancel_at_period_end) {
          return json({
            success: true,
            already_canceling: true,
            message: "Subscription is already scheduled for cancellation",
            current_period_end: entitlement.current_period_end,
          });
        }
        throw new Error("No active subscription found to cancel");
      }

      const updated = subscription.cancel_at_period_end
        ? subscription
        : await stripe.subscriptions.update(subscription.id, { cancel_at_period_end: true });
      log("Cancelled at period end", { id: updated.id, alreadyCanceling: subscription.cancel_at_period_end });

      // Fetch account
      const { data: account } = await supabaseClient
        .from('accounts')
        .select('id')
        .eq('owner_user_id', user.id)
        .maybeSingle();

      const periodEnd = await recordLocalCancellationState(updated);

      // Record cancellation
      try {
        const { data: existingCancellation } = await supabaseClient
          .from('subscription_cancellations')
          .select('id')
          .eq('owner_user_id', user.id)
          .eq('stripe_subscription_id', updated.id)
          .limit(1)
          .maybeSingle();

        if (!existingCancellation) {
          await supabaseClient.from('subscription_cancellations').insert({
            account_id: account?.id ?? null,
            owner_user_id: user.id,
            period_end: periodEnd,
            reason: reason ?? null,
            comments: comments ?? null,
            plan: (updated.items.data[0]?.price?.lookup_key as string) || null,
            stripe_subscription_id: updated.id,
          });
        }
      } catch (e) {
        console.error("[CANCEL-SUB] insert cancellation failed", e);
      }

      // Owner profile for name
      const { data: ownerProfile } = await supabaseClient
        .from('profiles')
        .select('first_name, last_name')
        .eq('user_id', user.id)
        .maybeSingle();
      const ownerName = ownerProfile
        ? `${ownerProfile.first_name || ''} ${ownerProfile.last_name || ''}`.trim() || user.email
        : user.email;

      // Send emails (idempotent)
      try {
        await supabaseClient.functions.invoke('send-cancellation-emails', {
          body: {
            account_id: account?.id ?? null,
            owner_user_id: user.id,
            owner_email: user.email,
            owner_name: ownerName,
            period_end: periodEnd,
          },
        });
      } catch (e) {
        console.error("[CANCEL-SUB] send-cancellation-emails failed", e);
      }

      return json({
        success: true,
        message: "Subscription will be canceled at the end of the billing period",
        cancel_at: updated.cancel_at,
        current_period_end: updated.current_period_end,
      });
    }

    if (action === 'reactivate') {
      const target = await findSubscription('reactivate');
      if (!target) throw new Error("No subscription found that is scheduled for cancellation");

      const updated = await stripe.subscriptions.update(target.id, { cancel_at_period_end: false });
      await recordLocalReactivationState(updated);

      return json({ success: true, message: "Subscription has been reactivated", status: updated.status });
    }

    throw new Error("Invalid action. Use 'cancel' or 'reactivate'");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log("ERROR", { message });
    return json({ error: message }, 500);
  }
});
