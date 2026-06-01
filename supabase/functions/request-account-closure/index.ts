import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (s: string, d?: any) => console.log(`[CLOSURE-REQ] ${s}${d ? ' ' + JSON.stringify(d) : ''}`);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: u, error: uerr } = await supabase.auth.getUser(token);
    if (uerr || !u.user) throw new Error("Invalid token");
    const user = u.user;

    const { reason, comments } = await req.json().catch(() => ({}));

    // Get account
    const { data: account } = await supabase
      .from('accounts')
      .select('id')
      .eq('owner_user_id', user.id)
      .maybeSingle();

    // Ensure Stripe sub cancel-at-period-end
    let periodEndIso: string | null = null;
    let subStatus: string | null = null;
    try {
      const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
      if (stripeKey && user.email) {
        const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
        const customers = await stripe.customers.list({ email: user.email, limit: 1 });
        const customerId = customers.data[0]?.id;
        if (customerId) {
          const subs = await stripe.subscriptions.list({ customer: customerId, limit: 5 });
          const active = subs.data.find((s) => s.status === 'active' || s.status === 'trialing');
          if (active && !active.cancel_at_period_end) {
            const updated = await stripe.subscriptions.update(active.id, { cancel_at_period_end: true });
            periodEndIso = updated.current_period_end ? new Date(updated.current_period_end * 1000).toISOString() : null;
            subStatus = updated.status;
          } else if (active) {
            periodEndIso = active.current_period_end ? new Date(active.current_period_end * 1000).toISOString() : null;
            subStatus = active.status;
          }
        }
      }
    } catch (e) {
      console.error("[CLOSURE-REQ] Stripe error (non-fatal)", e);
    }

    const scheduled = periodEndIso ? new Date(periodEndIso) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Insert closure request
    const { data: created, error: insErr } = await supabase
      .from('account_closure_requests')
      .insert({
        account_id: account?.id ?? null,
        owner_user_id: user.id,
        deletion_scheduled_date: scheduled.toISOString(),
        reason: reason ?? null,
        comments: comments ?? null,
        subscription_status: subStatus,
        current_period_end: periodEndIso,
        status: 'scheduled',
      })
      .select()
      .single();
    if (insErr) throw insErr;

    // Flip account status
    await supabase
      .from('profiles')
      .update({ account_status: 'scheduled_for_deletion', updated_at: new Date().toISOString() })
      .eq('user_id', user.id);

    log("Closure scheduled", { id: created.id, scheduled: scheduled.toISOString() });

    return new Response(JSON.stringify({ success: true, request: created }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    log("ERROR", { message: e?.message });
    return new Response(JSON.stringify({ error: e?.message || 'unknown error' }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
