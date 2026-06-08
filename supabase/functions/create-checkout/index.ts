import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  ALLOWED_BASE_LOOKUP_KEYS,
  ALLOWED_LOOKUP_KEYS,
  ALLOWED_STORAGE_LOOKUP_KEYS,
} from "../_shared/fulfillment.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (step: string, details?: unknown) =>
  console.log(`[CREATE-CHECKOUT] ${step}`, details === undefined ? "" : JSON.stringify(details));

function toLookupKey(_planType: string, billingInterval: string): string {
  const interval = billingInterval === "year" ? "annual" : "monthly";
  return `asset_safe_${interval}`;
}

async function rateLimit(
  supabaseAdmin: any,
  action: string,
  identifier: string,
  limit: number,
  windowMin: number,
): Promise<boolean> {
  const windowStart = new Date(Date.now() - windowMin * 60_000).toISOString();
  const { count } = await supabaseAdmin
    .from("rate_limits")
    .select("id", { count: "exact", head: true })
    .eq("action", action)
    .eq("identifier", identifier)
    .gte("created_at", windowStart);
  if ((count ?? 0) >= limit) return false;
  await supabaseAdmin.from("rate_limits").insert({
    action,
    identifier,
    attempts: 1,
    window_start: new Date().toISOString(),
  });
  return true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseAnon = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
  );
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  const ip =
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  const userAgent = req.headers.get("user-agent") ?? null;
  let auditEmail: string | null = null;
  let auditLookupKey: string | null = null;
  let auditSessionId: string | null = null;
  let auditOutcome = "started";
  let auditError: string | null = null;

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const body = await req.json();
    const { planLookupKey, planType, billingInterval = "month", email: providedEmail } = body;
    const lookupKey = planLookupKey || toLookupKey(planType || "standard", billingInterval);
    auditLookupKey = lookupKey;

    // Allow-list guard
    if (!ALLOWED_LOOKUP_KEYS.has(lookupKey)) {
      auditOutcome = "rejected_unknown_lookup_key";
      throw new Error(`Unsupported plan: ${lookupKey}`);
    }

    // Resolve authenticated user (optional for base plans).
    let user: { id: string; email: string } | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const { data: userData } = await supabaseAnon.auth.getUser(authHeader.replace("Bearer ", ""));
      if (userData?.user?.email) {
        user = { id: userData.user.id, email: userData.user.email };
      }
    }

    // Storage add-ons require auth.
    if (ALLOWED_STORAGE_LOOKUP_KEYS.has(lookupKey) && !user) {
      auditOutcome = "rejected_auth_required";
      return new Response(
        JSON.stringify({ error: "Authentication required for storage add-ons" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 },
      );
    }

    const userEmail = user?.email || providedEmail;
    if (!userEmail) {
      auditOutcome = "rejected_missing_email";
      throw new Error("Email required");
    }
    auditEmail = userEmail.toLowerCase().trim();

    // Abuse controls
    const ipLimit = await rateLimit(supabaseAdmin, "checkout_ip", ip, 5, 15);
    if (!ipLimit) {
      auditOutcome = "rejected_rate_limit_ip";
      return new Response(JSON.stringify({ error: "Too many attempts" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 429,
      });
    }
    const emailLimit = await rateLimit(supabaseAdmin, "checkout_email", auditEmail, 3, 15);
    if (!emailLimit) {
      auditOutcome = "rejected_rate_limit_email";
      return new Response(JSON.stringify({ error: "Too many attempts" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 429,
      });
    }

    // Storage add-on: require active base entitlement + matching customer.
    let reusedCustomerId: string | undefined;
    if (ALLOWED_STORAGE_LOOKUP_KEYS.has(lookupKey) && user) {
      const { data: ent } = await supabaseAdmin
        .from("entitlements")
        .select("status, stripe_customer_id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!ent || !["active", "trialing"].includes(ent.status)) {
        auditOutcome = "rejected_no_base_entitlement";
        throw new Error("Active Asset Safe plan required before adding storage");
      }
      if (!ent.stripe_customer_id) {
        auditOutcome = "rejected_no_stripe_customer";
        throw new Error("Billing profile not ready");
      }
      reusedCustomerId = ent.stripe_customer_id;
    } else if (user) {
      const { data: ent } = await supabaseAdmin
        .from("entitlements")
        .select("stripe_customer_id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (ent?.stripe_customer_id) reusedCustomerId = ent.stripe_customer_id;
    }

    // Server-resolved consent version.
    const { data: terms } = await supabaseAdmin
      .from("legal_terms_versions")
      .select("current_version")
      .eq("is_active", true)
      .order("effective_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const currentTermsVersion = terms?.current_version ?? "v1.0";
    const displayedTermsVersion =
      typeof body.displayed_terms_version === "string" ? body.displayed_terms_version : currentTermsVersion;

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const prices = await stripe.prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 });
    if (prices.data.length === 0) {
      auditOutcome = "rejected_no_active_price";
      throw new Error(`No active price for ${lookupKey}`);
    }
    const price = prices.data[0];
    const origin = req.headers.get("origin") || "https://www.getassetsafe.com";

    const session = await stripe.checkout.sessions.create({
      customer: reusedCustomerId,
      customer_email: reusedCustomerId ? undefined : userEmail,
      line_items: [{ price: price.id, quantity: 1 }],
      mode: "subscription",
      payment_method_types: ["card", "link", "amazon_pay"],
      success_url: `${origin}/subscription-success?session_id={CHECKOUT_SESSION_ID}&plan=${lookupKey}`,
      cancel_url: `${origin}/pricing?canceled=1`,
      payment_method_collection: "always",
      automatic_tax: { enabled: true },
      tax_id_collection: { enabled: true },
      billing_address_collection: "required",
      customer_update: reusedCustomerId ? { name: "auto", address: "auto" } : undefined,
      metadata: {
        plan_lookup_key: lookupKey,
        user_id: user?.id || "",
        checkout_origin: user ? "authenticated" : "anonymous",
        current_terms_version: currentTermsVersion,
        displayed_terms_version: displayedTermsVersion,
      },
    });
    auditSessionId = session.id;
    auditOutcome = "session_created";

    log("Checkout session created", { sessionId: session.id, lookupKey });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorId = crypto.randomUUID();
    auditError = (error as Error).message;
    log("ERROR", { errorId, message: auditError });
    return new Response(
      JSON.stringify({ error: "Payment processing failed. Please try again.", errorId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  } finally {
    try {
      await supabaseAdmin.from("checkout_session_audit").insert({
        ip,
        user_agent: userAgent,
        email: auditEmail,
        lookup_key: auditLookupKey,
        stripe_session_id: auditSessionId,
        outcome: auditOutcome,
        error_message: auditError,
      });
    } catch (_e) { /* swallow audit failures */ }
  }
});
