import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
    status,
  });

function getAllowedOrigin(rawOrigin: string | null): string {
  const fallback = "https://getassetsafe.com";
  if (!rawOrigin) return fallback;
  try {
    const url = new URL(rawOrigin);
    const isAssetSafe = url.protocol === "https:" && (
      url.hostname === "getassetsafe.com" ||
      url.hostname === "www.getassetsafe.com"
    );
    const isLocalDev = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    return isAssetSafe || isLocalDev ? url.origin : fallback;
  } catch {
    return fallback;
  }
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

  try {
    const { session_id } = await req.json().catch(() => ({}));
    if (!session_id || typeof session_id !== "string") {
      return json({ error: "invalid_link" }, 400);
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const ip =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";

    if (!(await rateLimit(supabaseAdmin, "mint_session", session_id, 8, 30))) {
      return json({ error: "try_again_later" }, 429);
    }
    if (!(await rateLimit(supabaseAdmin, "mint_ip", ip, 20, 60))) {
      return json({ error: "try_again_later" }, 429);
    }

    const { data: row } = await supabaseAdmin
      .from("checkout_fulfillments")
      .select("email, status, completed_at")
      .eq("stripe_session_id", session_id)
      .maybeSingle();

    if (!row?.email || !["fulfilled", "fulfilled_email_failed"].includes(row.status)) {
      return json({ error: "invalid_link" }, 400);
    }

    const completed = row.completed_at ? new Date(row.completed_at).getTime() : 0;
    if (!completed || Date.now() - completed > 24 * 60 * 60 * 1000) {
      return json({ error: "expired_link" }, 400);
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) return json({ error: "unavailable" }, 503);

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["customer_details"],
    });
    const stripeEmail = (session.customer_details?.email ?? "").toLowerCase().trim();
    if (!stripeEmail || stripeEmail !== row.email) {
      return json({ error: "invalid_link" }, 400);
    }

    const origin = getAllowedOrigin(req.headers.get("origin"));
    const redirectTo = `${origin}/auth/callback?session_id=${encodeURIComponent(session_id)}`;
    const { data: link, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: row.email,
      options: { redirectTo },
    });

    if (linkErr || !link?.properties?.action_link) {
      return json({ error: "unavailable" }, 503);
    }

    await supabaseAdmin
      .from("checkout_fulfillments")
      .update({
        magic_link_sent_at: new Date().toISOString(),
        magic_link_delivery_status: "minted",
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_session_id", session_id);

    return json({ redirect_url: link.properties.action_link });
  } catch (error) {
    console.error("[MINT-MAGIC-LINK] ERROR", { message: (error as Error).message });
    return json({ error: "unavailable" }, 503);
  }
});
