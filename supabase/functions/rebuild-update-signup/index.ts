// Rebuild update-list signup.
//
// Single purpose: record that someone asked to be notified about Asset Safe's
// return. It creates NO Supabase Auth user, NO profile, NO account, NO
// membership, NO subscription, NO password, and returns NO customer data.
//
// Existing contacts are NEVER modified. If the email already exists in the CRM,
// the contact row is left completely intact (source, first_name, last_name,
// phone, company_id, lifecycle, user_id, owner_id all untouched) and only a new
// event row is written.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/** Explicit origin allow-list. No wildcards, no *.lovable.app. */
const ALLOWED_ORIGINS = new Set<string>([
  "https://getassetsafe.com",
  "https://www.getassetsafe.com",
  "https://assetsafe.net",
  "https://www.assetsafe.net",
  "https://assetsafenet.lovable.app",
  // Private editor preview — required for owner QA of this form only.
  "https://id-preview--6cc71ded-5ae5-4631-b400-4bb41f9ebfd3.lovable.app",
  "http://localhost:8080",
]);

const SOURCE = "rebuild_update_signup";
const EVENT_NAME = "rebuild_update_signup";
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const EVENT_DEDUPE_WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_EMAIL_LENGTH = 254;

// Structural email check: single @, no whitespace, a dotted TLD of 2+ chars.
const EMAIL_PATTERN =
  /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~.-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

const INVALID_EMAIL_MESSAGE = "Please enter a valid email address.";
const GENERIC_FAILURE_MESSAGE =
  "We couldn't save your request. Please try again.";

const corsFor = (origin: string | null): Record<string, string> => {
  const base: Record<string, string> = {
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
  // Unknown origins receive no permissive CORS header at all.
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    base["Access-Control-Allow-Origin"] = origin;
  }
  return base;
};

serve(async (req) => {
  const origin = req.headers.get("origin");
  const cors = corsFor(origin);
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...cors, "content-type": "application/json" },
    });

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  if (req.method !== "POST") {
    return json({ ok: false, error: GENERIC_FAILURE_MESSAGE }, 405);
  }

  try {
    // ---- Parse and validate input (server-side enforcement) ----------------
    let payload: unknown;
    try {
      payload = await req.json();
    } catch {
      return json({ ok: false, error: INVALID_EMAIL_MESSAGE }, 400);
    }

    if (typeof payload !== "object" || payload === null) {
      return json({ ok: false, error: INVALID_EMAIL_MESSAGE }, 400);
    }

    const keys = Object.keys(payload as Record<string, unknown>);
    // Reject unexpected fields — this endpoint accepts an email and nothing else.
    if (keys.some((key) => key !== "email")) {
      return json({ ok: false, error: INVALID_EMAIL_MESSAGE }, 400);
    }

    const raw = (payload as { email?: unknown }).email;
    if (typeof raw !== "string") {
      return json({ ok: false, error: INVALID_EMAIL_MESSAGE }, 400);
    }

    const email = raw.trim().toLowerCase();
    if (
      email.length === 0 ||
      email.length > MAX_EMAIL_LENGTH ||
      !EMAIL_PATTERN.test(email)
    ) {
      return json({ ok: false, error: INVALID_EMAIL_MESSAGE }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // ---- Durable per-IP rate limiting (shared rate_limits table) -----------
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    const rlKey = `rebuild_update_signup:${ip}`;
    const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();

    const { count: attempts } = await supabase
      .from("rate_limits")
      .select("id", { count: "exact", head: true })
      .eq("identifier", rlKey)
      .gte("created_at", since);

    if ((attempts ?? 0) >= RATE_LIMIT_MAX) {
      return json({ ok: false, error: GENERIC_FAILURE_MESSAGE }, 429);
    }

    await supabase.from("rate_limits").insert({
      identifier: rlKey,
      action: SOURCE,
      window_start: new Date().toISOString(),
    });

    // ---- Resolve the contact by normalized email --------------------------
    const { data: existing, error: lookupError } = await supabase
      .from("contacts")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (lookupError) {
      console.error("rebuild-update-signup lookup failed:", lookupError);
      return json({ ok: false, error: GENERIC_FAILURE_MESSAGE }, 500);
    }

    let contactId = existing?.id ?? null;

    if (!contactId) {
      // New email: create the minimal record only.
      const { data: created, error: insertError } = await supabase
        .from("contacts")
        .insert({ email, source: SOURCE, lifecycle: "lead" })
        .select("id")
        .single();

      if (insertError) {
        // A concurrent request may have created it between lookup and insert.
        const { data: raced } = await supabase
          .from("contacts")
          .select("id")
          .eq("email", email)
          .maybeSingle();

        if (!raced?.id) {
          console.error("rebuild-update-signup insert failed:", insertError);
          return json({ ok: false, error: GENERIC_FAILURE_MESSAGE }, 500);
        }
        contactId = raced.id;
      } else {
        contactId = created?.id ?? null;
      }
    }
    // Existing email: intentionally no UPDATE of any kind. The original source
    // and every other CRM field are preserved.

    // ---- Record the signup request as an event ----------------------------
    if (contactId) {
      const dedupeSince = new Date(
        Date.now() - EVENT_DEDUPE_WINDOW_MS,
      ).toISOString();

      const { count: recentEvents } = await supabase
        .from("events")
        .select("id", { count: "exact", head: true })
        .eq("event", EVENT_NAME)
        .eq("props->>contact_id", contactId)
        .gte("occurred_at", dedupeSince);

      if ((recentEvents ?? 0) === 0) {
        const { error: eventError } = await supabase.from("events").insert({
          event: EVENT_NAME,
          props: { contact_id: contactId, source: SOURCE },
        });
        if (eventError) {
          // The signup itself succeeded; log and continue.
          console.error("rebuild-update-signup event failed:", eventError);
        }
      }
    }

    return json({ ok: true });
  } catch (e) {
    console.error("rebuild-update-signup unexpected error:", e);
    return json({ ok: false, error: GENERIC_FAILURE_MESSAGE }, 500);
  }
});
