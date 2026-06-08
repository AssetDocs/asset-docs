import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { requireStepUp, getClientIp } from "../_shared/mfa.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (s: string, d?: any) => console.log(`[CANCEL-SUB] ${s}${d ? ' ' + JSON.stringify(d) : ''}`);

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
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) throw new Error("No Stripe customer found for this user");
    const customerId = customers.data[0].id;

    const all = await stripe.subscriptions.list({ customer: customerId, limit: 10 });
    const activeSubs = all.data.filter((s) => s.status === 'active' || s.status === 'trialing');

    if (action === 'cancel') {
      const subscription = activeSubs[0];
      if (!subscription) throw new Error("No active subscription found to cancel");

      const updated = await stripe.subscriptions.update(subscription.id, { cancel_at_period_end: true });
      log("Cancelled at period end", { id: subscription.id });

      // Update profile to reflect status
      await supabaseClient
        .from('profiles')
        .update({
          plan_status: 'canceling',
          account_status: 'cancelled_billing_active',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      // Fetch account
      const { data: account } = await supabaseClient
        .from('accounts')
        .select('id')
        .eq('owner_user_id', user.id)
        .maybeSingle();

      const periodEnd = updated.current_period_end
        ? new Date(updated.current_period_end * 1000).toISOString()
        : null;

      // Record cancellation
      try {
        await supabaseClient.from('subscription_cancellations').insert({
          account_id: account?.id ?? null,
          owner_user_id: user.id,
          period_end: periodEnd,
          reason: reason ?? null,
          comments: comments ?? null,
          plan: (subscription.items.data[0]?.price?.lookup_key as string) || null,
          stripe_subscription_id: subscription.id,
        });
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

      return new Response(JSON.stringify({
        success: true,
        message: "Subscription will be canceled at the end of the billing period",
        cancel_at: updated.cancel_at,
        current_period_end: updated.current_period_end,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
    }

    if (action === 'reactivate') {
      const target = all.data.find((s) => s.cancel_at_period_end === true);
      if (!target) throw new Error("No subscription found that is scheduled for cancellation");

      const updated = await stripe.subscriptions.update(target.id, { cancel_at_period_end: false });

      await supabaseClient
        .from('profiles')
        .update({
          plan_status: 'active',
          account_status: 'active',
          cancellation_notice_sent_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      return new Response(JSON.stringify({ success: true, message: "Subscription has been reactivated", status: updated.status }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
      });
    }

    throw new Error("Invalid action. Use 'cancel' or 'reactivate'");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log("ERROR", { message });
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
    });
  }
});
