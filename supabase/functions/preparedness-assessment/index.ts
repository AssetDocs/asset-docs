//
// No Auth user, profile, membership, password, subscription or Stripe customer is ever created.
// Existing contacts are never modified. No IP is stored on assessments; IP is used only
// transiently as the rate_limits key (existing infrastructure).

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = new Set<string>([
  "https://getassetsafe.com",
  "https://www.getassetsafe.com",
  "https://assetsafe.net",
  "https://www.assetsafe.net",
  "https://assetsafenet.lovable.app",
  "https://id-preview--6cc71ded-5ae5-4631-b400-4bb41f9ebfd3.lovable.app",
  "http://localhost:8080",
]);

const VERSION = "v1";
const SOURCE = "preparedness_assessment";
const EVENT_NAME = "preparedness_early_access";
const WINDOW_MS = 15 * 60 * 1000;
const LIMITS = { submit: 10, join: 5, research: 10 } as const;
const DEDUPE_MS = 24 * 60 * 60 * 1000;
const GENERIC = "We couldn't save your request. Please try again.";
const EMAIL_RE = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~.-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Authoritative scoring table (mirror of src/data/preparednessAssessment.ts).
const QUESTIONS: Record<string, number> = {
  legacy_preparedness: 0.3,
  property_inventory: 0.2,
  information_organization: 0.2,
  property_value_awareness: 0.15,
  digital_access: 0.15,
};
const TIE_BREAK = Object.keys(QUESTIONS); // insertion order above = tie-break order
const POINTS: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };
const WTP = new Set(["under_10", "10_15", "16_20", "21_25", "over_25", "prefer_annual", "would_not_pay"]);
const AUDIENCE = new Set(["homeowner", "renter", "landlord", "business_owner", "other"]);
const INTEREST = new Set([
  "documenting_possessions", "insurance_preparedness", "organizing_records",
  "passwords_accounts", "family_preparation", "property_records", "something_else",
]);

const band = (s: number) =>
  s <= 24 ? "strong_foundation" : s <= 49 ? "some_gaps" : s <= 74 ? "significant_opportunity" : "strong_asset_safe_fit";

const score = (answers: Record<string, unknown>) => {
  const keys = Object.keys(answers);
  if (keys.length !== 5 || keys.some((k) => !(k in QUESTIONS))) return null;
  const gaps: { k: string; g: number }[] = [];
  for (const k of TIE_BREAK) {
    const v = answers[k];
    if (typeof v !== "string" || !(v in POINTS)) return null;
    gaps.push({ k, g: (POINTS[v] / 3) * QUESTIONS[k] });
  }
  const fit = Math.round(gaps.reduce((t, x) => t + x.g, 0) * 100 + 1e-9);
  const top = gaps.filter((x) => x.g > 0)
    .sort((a, b) => b.g - a.g || TIE_BREAK.indexOf(a.k) - TIE_BREAK.indexOf(b.k))
    .slice(0, 2).map((x) => x.k);
  return { fit, band: band(fit), top };
};

const onlyKeys = (o: Record<string, unknown>, allowed: string[]) =>
  Object.keys(o).every((k) => allowed.includes(k));

const cleanUtm = (u: unknown) => {
  if (!u || typeof u !== "object") return null;
  const out: Record<string, string> = {};
  for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
    const v = (u as Record<string, unknown>)[k];
    if (typeof v === "string" && v.length) out[k] = v.slice(0, 100);
  }
  return Object.keys(out).length ? out : null;
};

serve(async (req) => {
  const origin = req.headers.get("origin");
  const cors: Record<string, string> = {
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
  if (origin && ALLOWED_ORIGINS.has(origin)) cors["Access-Control-Allow-Origin"] = origin;
  const json = (b: unknown, s = 200) =>
    new Response(JSON.stringify(b), { status: s, headers: { ...cors, "content-type": "application/json" } });

  // Browser requests from unapproved origins are rejected before any reads/writes.
  // Requests without an Origin header (server/CLI) fall through to validation + rate limits.
  if (origin !== null && !ALLOWED_ORIGINS.has(origin)) return json({ ok: false, error: GENERIC }, 403);

  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ ok: false, error: GENERIC }, 405);

  try {
    const raw = await req.text();
    if (raw.length > 4096) return json({ ok: false, error: GENERIC }, 400);
    let body: Record<string, unknown>;
    try { body = JSON.parse(raw); } catch { return json({ ok: false, error: GENERIC }, 400); }
    if (!body || typeof body !== "object") return json({ ok: false, error: GENERIC }, 400);

    const action = body.action;
    if (action !== "submit" && action !== "join" && action !== "research") {
      return json({ ok: false, error: GENERIC }, 400);
    }

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Rate limit (existing rate_limits table; IP used transiently as key only).
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    const rlKey = `preparedness_${action}:${ip}`;
    const { count } = await sb.from("rate_limits").select("id", { count: "exact", head: true })
      .eq("identifier", rlKey).gte("created_at", new Date(Date.now() - WINDOW_MS).toISOString());
    if ((count ?? 0) >= LIMITS[action]) return json({ ok: false, error: GENERIC }, 429);
    await sb.from("rate_limits").insert({ identifier: rlKey, action: `preparedness_${action}`, window_start: new Date().toISOString() });

    // ---- submit ------------------------------------------------------------
    if (action === "submit") {
      if (!onlyKeys(body, ["action", "version", "session_id", "answers", "willingness_to_pay", "utm", "referrer", "qa"])) {
        return json({ ok: false, error: GENERIC }, 400);
      }
      if (body.version !== VERSION) return json({ ok: false, error: GENERIC }, 400);
      const sid = body.session_id;
      if (typeof sid !== "string" || !UUID_RE.test(sid)) return json({ ok: false, error: GENERIC }, 400);
      if (!body.answers || typeof body.answers !== "object") return json({ ok: false, error: GENERIC }, 400);
      const result = score(body.answers as Record<string, unknown>);
      if (!result) return json({ ok: false, error: GENERIC }, 400);
      const wtp = body.willingness_to_pay;
      if (wtp != null && (typeof wtp !== "string" || !WTP.has(wtp))) return json({ ok: false, error: GENERIC }, 400);

      const utm = cleanUtm(body.utm);
      const isQa = body.qa === true || utm?.utm_source === "qa";
      const { data, error } = await sb.from("preparedness_assessments").insert({
        assessment_version: VERSION,
        session_id: sid,
        answers: body.answers,
        fit_score: result.fit,
        band: result.band,
        top_gaps: result.top,
        willingness_to_pay: wtp ?? null,
        utm,
        referrer: typeof body.referrer === "string" ? body.referrer.slice(0, 300) : null,
        is_qa: isQa,
      }).select("id").single();
      if (error) { console.error("assessment insert failed", error.code); return json({ ok: false, error: GENERIC }, 500); }
      return json({ ok: true, assessment_id: data.id, fit_score: result.fit, band: result.band, top_gaps: result.top });
    }

    const aid = body.assessment_id;
    if (typeof aid !== "string" || !UUID_RE.test(aid)) return json({ ok: false, error: GENERIC }, 400);

    // ---- join --------------------------------------------------------------
    if (action === "join") {
      if (!onlyKeys(body, ["action", "assessment_id", "email", "consent"]) || body.consent !== true) {
        return json({ ok: false, error: GENERIC }, 400);
      }
      const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
      if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
        return json({ ok: false, error: "Please enter a valid email address." }, 400);
      }
      const { data: row } = await sb.from("preparedness_assessments").select("id").eq("id", aid).maybeSingle();
      if (!row) return json({ ok: false, error: GENERIC }, 400);

      let { data: c } = await sb.from("contacts").select("id").eq("email", email).maybeSingle();
      if (!c) {
        const ins = await sb.from("contacts").insert({ email, source: SOURCE, lifecycle: "lead" }).select("id").single();
        if (ins.error) {
          const raced = await sb.from("contacts").select("id").eq("email", email).maybeSingle();
          if (!raced.data) return json({ ok: false, error: GENERIC }, 500);
          c = raced.data;
        } else c = ins.data;
      }
      // Existing contact fields are never updated — only the assessment row is linked.
      await sb.from("preparedness_assessments")
        .update({ contact_id: c!.id, early_access_opt_in: true, consent_at: new Date().toISOString() })
        .eq("id", aid);

      const since = new Date(Date.now() - DEDUPE_MS).toISOString();
      const { count: recent } = await sb.from("events").select("id", { count: "exact", head: true })
        .eq("event", EVENT_NAME).contains("props", { contact_id: c!.id }).gte("occurred_at", since);
      if ((recent ?? 0) === 0) {
        await sb.from("events").insert({ event: EVENT_NAME, props: { contact_id: c!.id, assessment_id: aid, source: SOURCE } });
      }
      return json({ ok: true });
    }

    // ---- research (optional, post-join) -----------------------------------
    if (!onlyKeys(body, ["action", "assessment_id", "audience_segment", "primary_interest"])) {
      return json({ ok: false, error: GENERIC }, 400);
    }
    const seg = body.audience_segment ?? null;
    const int = body.primary_interest ?? null;
    if ((seg !== null && (typeof seg !== "string" || !AUDIENCE.has(seg))) ||
        (int !== null && (typeof int !== "string" || !INTEREST.has(int)))) {
      return json({ ok: false, error: GENERIC }, 400);
    }
    await sb.from("preparedness_assessments")
      .update({ audience_segment: seg, primary_interest: int })
      .eq("id", aid).eq("early_access_opt_in", true);
    return json({ ok: true });
  } catch (e) {
    console.error("preparedness-assessment error", (e as Error).name);
    return json({ ok: false, error: GENERIC }, 500);
  }
});
