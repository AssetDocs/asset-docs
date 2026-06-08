import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { fulfillCheckout } from "../_shared/fulfillment.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (step: string, details?: unknown) =>
  console.log(`[FINALIZE-CHECKOUT] ${step}`, details === undefined ? "" : JSON.stringify(details));

const POLL_INTERVAL_MS = 1000;
const POLL_MAX_MS = 10_000;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const { session_id } = await req.json();
    if (!session_id) throw new Error("session_id is required");

    // Poll for fulfillment row (webhook may already be processing).
    const start = Date.now();
    let existing: any = null;
    while (Date.now() - start < POLL_MAX_MS) {
      const { data } = await supabaseAdmin
        .from("checkout_fulfillments")
        .select("status, magic_link_delivery_status, manual_review_reason")
        .eq("stripe_session_id", session_id)
        .maybeSingle();
      existing = data;
      if (
        existing &&
        ["fulfilled", "fulfilled_email_failed", "manual_review", "rejected"].includes(
          existing.status,
        )
      ) {
        break;
      }
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }

    if (existing?.status === "fulfilled") {
      return new Response(JSON.stringify({ status: "fulfilled" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    if (existing?.status === "fulfilled_email_failed") {
      return new Response(JSON.stringify({ status: "fulfilled_email_failed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    if (existing?.status === "manual_review") {
      return new Response(
        JSON.stringify({ status: "manual_review", reason: existing.manual_review_reason }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
      );
    }
    if (existing?.status === "rejected") {
      return new Response(JSON.stringify({ status: "rejected" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // No terminal row yet — re-verify Stripe and attempt recovery fulfillment.
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["customer", "subscription", "subscription.items.data.price", "customer_details"],
    });
    log("Stripe session re-fetched", {
      payment_status: session.payment_status,
      mode: session.mode,
    });

    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ status: "pending" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const origin = req.headers.get("origin") || "https://www.getassetsafe.com";
    const result = await fulfillCheckout(stripe, supabaseAdmin, session, {
      source: "finalize-checkout-recovery",
      origin,
    });

    let status: string = result.status;
    if (status === "already_done") status = "fulfilled";
    if (status === "in_progress") status = "pending";
    if (status === "failed_retryable") status = "pending";

    return new Response(JSON.stringify({ status }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorId = crypto.randomUUID();
    log("ERROR", { errorId, message: (error as Error).message });
    return new Response(
      JSON.stringify({ status: "error", errorId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
