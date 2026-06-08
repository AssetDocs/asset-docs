import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { fulfillCheckout } from "../_shared/fulfillment.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (step: string, details?: unknown) =>
  console.log(`[ADMIN-APPROVE-FULFILLMENT] ${step}`, details === undefined ? "" : JSON.stringify(details));

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Caller context — uses admin token to call the RPC (RPC enforces role).
    const supabaseCaller = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const { fulfillment_id, decision, override_user_id, override_reason, notes } =
      await req.json();

    // Validate admin via RPC (also flips reject for us).
    const { data: rpcResult, error: rpcErr } = await supabaseCaller.rpc(
      "admin_resolve_manual_review",
      {
        p_fulfillment_id: fulfillment_id,
        p_decision: decision,
        p_override_user_id: override_user_id ?? null,
        p_override_reason: override_reason ?? null,
        p_notes: notes ?? null,
      },
    );
    if (rpcErr) {
      return new Response(JSON.stringify({ error: rpcErr.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: rpcErr.message === "forbidden" ? 403 : 400,
      });
    }
    if (rpcResult?.status === "rejected") {
      return new Response(JSON.stringify({ status: "rejected" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    if (rpcResult?.status !== "ready_to_fulfill") {
      return new Response(JSON.stringify({ error: "unexpected_rpc_status" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Re-fetch session from Stripe (live source of truth).
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const session = await stripe.checkout.sessions.retrieve(
      rpcResult.stripe_session_id,
      { expand: ["customer", "subscription", "subscription.items.data.price", "customer_details"] },
    );

    const stripeEmail = (session.customer_details?.email ?? "").toLowerCase().trim();
    const adminUserId = rpcResult.admin_user_id as string;

    // Look up override user email (for audit) and email-match flag.
    let overrideEmail: string | null = null;
    let emailMatched = false;
    if (override_user_id) {
      const { data: u } = await supabaseAdmin.auth.admin.getUserById(override_user_id);
      overrideEmail = (u?.user?.email ?? "").toLowerCase() || null;
      emailMatched = !!overrideEmail && overrideEmail === stripeEmail;
    }

    // Pre-write audit row of intent.
    const cleanReason = (override_reason ?? "").trim();
    const reasonOk = emailMatched || cleanReason.length >= 20;
    let intentOutcome: string;
    if (!override_user_id) intentOutcome = "rejected_user_not_found";
    else if (!overrideEmail) intentOutcome = "rejected_user_not_found";
    else if (!reasonOk) intentOutcome = "rejected_missing_reason";
    else intentOutcome = emailMatched ? "fulfilled" : "fulfilled_with_email_mismatch";

    await supabaseAdmin.from("admin_fulfillment_overrides").insert({
      admin_user_id: adminUserId,
      fulfillment_id,
      stripe_session_id: rpcResult.stripe_session_id,
      stripe_customer_id:
        typeof session.customer === "string" ? session.customer : session.customer?.id ?? null,
      original_metadata_user_id: session.metadata?.user_id || null,
      override_user_id,
      stripe_email: stripeEmail,
      override_user_email: overrideEmail,
      email_matched: emailMatched,
      decision: "approve",
      override_reason: cleanReason || null,
      notes: notes ?? null,
      outcome: intentOutcome,
      manual_review_reason_at_decision: rpcResult.manual_review_reason ?? null,
    });

    if (intentOutcome === "rejected_user_not_found" || intentOutcome === "rejected_missing_reason") {
      return new Response(JSON.stringify({ status: "rejected", reason: intentOutcome }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Run shared fulfillment with admin context.
    const result = await fulfillCheckout(stripe, supabaseAdmin, session, {
      source: "admin-override",
      adminOverride: {
        admin_user_id: adminUserId,
        override_user_id,
        override_reason: cleanReason || null,
        notes: notes ?? null,
        fulfillment_id,
      },
    });

    if (result.status === "rejected") {
      // Record final outcome correction.
      await supabaseAdmin.from("admin_fulfillment_overrides").insert({
        admin_user_id: adminUserId,
        fulfillment_id,
        stripe_session_id: rpcResult.stripe_session_id,
        original_metadata_user_id: session.metadata?.user_id || null,
        override_user_id,
        stripe_email: stripeEmail,
        override_user_email: overrideEmail,
        email_matched: emailMatched,
        decision: "approve",
        override_reason: cleanReason || null,
        notes: notes ?? null,
        outcome: `rejected_${result.reason}`,
        manual_review_reason_at_decision: rpcResult.manual_review_reason ?? null,
      });
      return new Response(JSON.stringify({ status: "rejected", reason: result.reason }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Stamp the resolution on the fulfillment row.
    if (result.status === "fulfilled" || result.status === "fulfilled_email_failed") {
      await supabaseAdmin
        .from("checkout_fulfillments")
        .update({
          manual_review_resolved_at: new Date().toISOString(),
          manual_review_resolved_by: adminUserId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", fulfillment_id);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorId = crypto.randomUUID();
    log("ERROR", { errorId, message: (error as Error).message });
    return new Response(
      JSON.stringify({ error: "Override failed", errorId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
