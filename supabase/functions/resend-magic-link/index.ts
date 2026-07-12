import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (step: string, details?: unknown) =>
  console.log(`[RESEND-MAGIC-LINK] ${step}`, details === undefined ? "" : JSON.stringify(details));

const UNIFORM_OK = () =>
  new Response(JSON.stringify({ status: "sent" }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });

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
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const { session_id } = await req.json().catch(() => ({}));
    if (!session_id || typeof session_id !== "string") return UNIFORM_OK();

    const ip =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";

    if (!(await rateLimit(supabaseAdmin, "resend_session", session_id, 3, 30))) return UNIFORM_OK();
    if (!(await rateLimit(supabaseAdmin, "resend_ip", ip, 5, 60))) return UNIFORM_OK();

    const { data: row } = await supabaseAdmin
      .from("checkout_fulfillments")
      .select("email, status, completed_at")
      .eq("stripe_session_id", session_id)
      .maybeSingle();

    if (!row || !row.email) return UNIFORM_OK();
    if (!["fulfilled", "fulfilled_email_failed"].includes(row.status)) return UNIFORM_OK();

    const completed = row.completed_at ? new Date(row.completed_at).getTime() : 0;
    if (Date.now() - completed > 24 * 60 * 60 * 1000) return UNIFORM_OK();

    if (!(await rateLimit(supabaseAdmin, "resend_email", row.email, 5, 60))) return UNIFORM_OK();

    // Verify against live Stripe session.
    if (!stripeKey) return UNIFORM_OK();
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["customer_details"],
    });
    const stripeEmail = (session.customer_details?.email ?? "").toLowerCase().trim();
    if (!stripeEmail || stripeEmail !== row.email) return UNIFORM_OK();

    const origin = req.headers.get("origin") || "https://getassetsafe.com";
    const { data: link, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: row.email,
      options: { redirectTo: `${origin}/auth/callback` },
    });
    if (linkErr || !link?.properties?.action_link) return UNIFORM_OK();

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: "Asset Safe <noreply@assetsafe.net>",
          to: [row.email],
          subject: "Your sign-in link for Asset Safe",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>New sign-in link</h2>
              <p>Click below to sign in (expires in 1 hour):</p>
              <p style="text-align:center;margin:32px 0;">
                <a href="${link.properties.action_link}" style="background:#f97316;color:#fff;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:bold;">Sign In</a>
              </p>
            </div>
          `,
        }),
      });
    }

    await supabaseAdmin
      .from("checkout_fulfillments")
      .update({
        magic_link_sent_at: new Date().toISOString(),
        magic_link_delivery_status: "resent",
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_session_id", session_id);

    return UNIFORM_OK();
  } catch (error) {
    log("ERROR (returning uniform success)", { message: (error as Error).message });
    return UNIFORM_OK();
  }
});
