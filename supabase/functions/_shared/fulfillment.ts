// Shared checkout fulfillment routine — single source of truth for
// turning a paid Stripe Checkout Session into a fully provisioned user
// + entitlement + workspace + magic link.
//
// Called by:
//   - stripe-webhook (checkout.session.completed) — authoritative path
//   - finalize-checkout (recovery / polling path)
//   - admin-approve-fulfillment (manual review override path)

import Stripe from "https://esm.sh/stripe@14.21.0";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const ALLOWED_BASE_LOOKUP_KEYS = new Set([
  "asset_safe_monthly",
  "asset_safe_annual",
  "asset_safe_gift_annual",
]);
export const ALLOWED_STORAGE_LOOKUP_KEYS = new Set(["storage_25gb_monthly"]);
export const ALLOWED_LOOKUP_KEYS = new Set([
  ...ALLOWED_BASE_LOOKUP_KEYS,
  ...ALLOWED_STORAGE_LOOKUP_KEYS,
]);

const PROCESSING_STALE_MINUTES = 10;

const log = (step: string, details?: unknown) => {
  console.log(
    `[FULFILLMENT] ${step}`,
    details === undefined ? "" : JSON.stringify(details),
  );
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FulfillmentSource =
  | "stripe-webhook"
  | "finalize-checkout-recovery"
  | "admin-override";

export interface AdminOverrideContext {
  admin_user_id: string;
  override_user_id: string;
  override_reason: string | null;
  notes: string | null;
  fulfillment_id: string;
}

export type FulfillmentResult =
  | { status: "fulfilled"; user_id: string; fulfillment_id: string }
  | { status: "fulfilled_email_failed"; user_id: string; fulfillment_id: string; error: string }
  | { status: "already_done"; fulfillment_id: string }
  | { status: "in_progress"; fulfillment_id: string }
  | { status: "manual_review"; fulfillment_id: string; reason: string }
  | { status: "failed_retryable"; error: string }
  | { status: "rejected"; reason: string };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractSessionDetails(session: Stripe.Checkout.Session) {
  const email = (session.customer_details?.email ?? session.customer_email ?? "")
    .toLowerCase()
    .trim();
  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id ?? null;
  const subscription = session.subscription as Stripe.Subscription | null;
  const subscriptionId = subscription?.id ?? null;
  const priceItem = subscription?.items?.data?.[0];
  const priceId = priceItem?.price?.id ?? null;
  const lookupKey = priceItem?.price?.lookup_key ?? session.metadata?.plan_lookup_key ?? null;
  const customerName = session.customer_details?.name ?? null;
  const metadataUserId = session.metadata?.user_id || null;
  const currentTermsVersion = session.metadata?.current_terms_version || null;
  const displayedTermsVersion = session.metadata?.displayed_terms_version || null;
  return {
    email,
    customerId,
    subscriptionId,
    priceId,
    lookupKey,
    customerName,
    metadataUserId,
    currentTermsVersion,
    displayedTermsVersion,
  };
}

async function adminFetchUserByEmail(
  supabaseUrl: string,
  serviceRoleKey: string,
  email: string,
): Promise<{ id: string; email: string } | null> {
  // Uses filtered Admin API to avoid the 1000-row scan limitation.
  const url = `${supabaseUrl}/auth/v1/admin/users?filter=email.eq.${encodeURIComponent(email)}`;
  const res = await fetch(url, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
  });
  if (!res.ok) return null;
  const data = await res.json().catch(() => null) as any;
  const user = data?.users?.find(
    (u: any) => (u.email || "").toLowerCase() === email.toLowerCase(),
  );
  return user ? { id: user.id, email: user.email } : null;
}

async function isDeletedAccountEmail(supabaseAdmin: any, email: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin.rpc("is_deleted_account_email", {
    p_email: email,
  });

  if (error) {
    throw new Error(`deleted_account_guard_failed:${error.message}`);
  }

  return data === true;
}

// ---------------------------------------------------------------------------
// Claim row (atomic-ish — single round trip when possible)
// ---------------------------------------------------------------------------

async function claimFulfillmentRow(
  supabaseAdmin: any,
  session: Stripe.Checkout.Session,
  source: FulfillmentSource,
  details: ReturnType<typeof extractSessionDetails>,
): Promise<
  | { kind: "claimed"; id: string }
  | { kind: "already_done"; id: string }
  | { kind: "in_progress"; id: string }
> {
  const baseRow = {
    stripe_session_id: session.id,
    stripe_subscription_id: details.subscriptionId,
    stripe_customer_id: details.customerId,
    email: details.email,
    plan_lookup_key: details.lookupKey,
    fulfillment_source: source,
    status: "processing",
    processing_started_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Attempt straight insert first.
  const { data: inserted, error: insertErr } = await supabaseAdmin
    .from("checkout_fulfillments")
    .insert(baseRow)
    .select("id, status")
    .maybeSingle();

  if (!insertErr && inserted) {
    return { kind: "claimed", id: inserted.id };
  }

  // On conflict (unique stripe_session_id) inspect the existing row.
  const { data: existing } = await supabaseAdmin
    .from("checkout_fulfillments")
    .select("id, status, processing_started_at")
    .eq("stripe_session_id", session.id)
    .maybeSingle();

  if (!existing) {
    // Unknown failure — surface as retryable.
    throw new Error(`claim_failed: ${insertErr?.message ?? "unknown"}`);
  }

  if (
    existing.status === "fulfilled" ||
    existing.status === "fulfilled_email_failed" ||
    existing.status === "rejected"
  ) {
    return { kind: "already_done", id: existing.id };
  }

  if (existing.status === "manual_review") {
    return { kind: "already_done", id: existing.id };
  }

  if (existing.status === "processing") {
    const startedAt = existing.processing_started_at
      ? new Date(existing.processing_started_at).getTime()
      : 0;
    const ageMin = (Date.now() - startedAt) / 60000;
    if (ageMin < PROCESSING_STALE_MINUTES) {
      return { kind: "in_progress", id: existing.id };
    }
  }

  // Re-claim stale processing or pending / failed_retryable.
  const eligibleStatuses = ["pending", "failed_retryable", "processing"];
  const { data: reclaimed } = await supabaseAdmin
    .from("checkout_fulfillments")
    .update({
      status: "processing",
      processing_started_at: new Date().toISOString(),
      fulfillment_source: source,
      updated_at: new Date().toISOString(),
    })
    .eq("id", existing.id)
    .in("status", eligibleStatuses)
    .select("id")
    .maybeSingle();

  if (reclaimed) return { kind: "claimed", id: existing.id };
  return { kind: "in_progress", id: existing.id };
}

// ---------------------------------------------------------------------------
// Manual review marker
// ---------------------------------------------------------------------------

async function markManualReview(
  supabaseAdmin: any,
  fulfillmentId: string,
  reason: string,
): Promise<FulfillmentResult> {
  await supabaseAdmin
    .from("checkout_fulfillments")
    .update({
      status: "manual_review",
      manual_review_reason: reason,
      updated_at: new Date().toISOString(),
    })
    .eq("id", fulfillmentId);
  log("Marked manual_review", { fulfillmentId, reason });
  return { status: "manual_review", fulfillmentId, reason } as FulfillmentResult;
}

// ---------------------------------------------------------------------------
// Magic link
// ---------------------------------------------------------------------------

async function sendMagicLink(
  supabaseAdmin: any,
  email: string,
  origin: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo: `${origin}/auth/callback` },
    });
    if (error) return { ok: false, error: error.message };
    const link = data?.properties?.action_link;
    if (!link) return { ok: false, error: "no_action_link" };

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) return { ok: false, error: "missing_resend_key" };

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: "Asset Safe <noreply@assetsafe.net>",
        to: [email],
        subject: "Your payment is confirmed — sign in to Asset Safe",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color:#1a1a1a;">Payment Confirmed</h2>
            <p>Your Asset Safe subscription is active.</p>
            <p>Click below to sign in (link expires in 1 hour):</p>
            <p style="text-align:center;margin:32px 0;">
              <a href="${link}" style="background:#f97316;color:#fff;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:bold;">Sign In to Asset Safe</a>
            </p>
            <p style="color:#666;font-size:13px;">If you didn't expect this email, you can safely ignore it.</p>
          </div>
        `,
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, error: `resend_${res.status}:${text.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

// ---------------------------------------------------------------------------
// Workspace creation (idempotent)
// ---------------------------------------------------------------------------

async function ensureWorkspace(
  supabaseAdmin: any,
  userId: string,
  email: string,
  firstName: string | null,
  lastName: string | null,
) {
  // profiles upsert (do not clobber if already present)
  await supabaseAdmin
    .from("profiles")
    .upsert(
      {
        user_id: userId,
        email,
        first_name: firstName,
        last_name: lastName,
        property_limit: 999999,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id", ignoreDuplicates: false },
    );

  // accounts (owner workspace) — only insert if user has no owned account
  const { data: existingMembership } = await supabaseAdmin
    .from("account_memberships")
    .select("account_id, role")
    .eq("user_id", userId)
    .eq("role", "owner")
    .maybeSingle();

  if (!existingMembership) {
    const { data: newAccount, error: acctErr } = await supabaseAdmin
      .from("accounts")
      .insert({ owner_user_id: userId })
      .select("id")
      .maybeSingle();
    if (!acctErr && newAccount?.id) {
      await supabaseAdmin.from("account_memberships").insert({
        account_id: newAccount.id,
        user_id: userId,
        role: "owner",
      });
    }
  }

  // notification preferences (defaults) — ignore if exists
  await supabaseAdmin
    .from("notification_preferences")
    .upsert({ user_id: userId }, { onConflict: "user_id", ignoreDuplicates: true });
}

// ---------------------------------------------------------------------------
// Entitlement writers
// ---------------------------------------------------------------------------

async function upsertBaseEntitlement(
  supabaseAdmin: any,
  userId: string,
  details: ReturnType<typeof extractSessionDetails>,
  sourceEventId: string,
) {
  const baseStorageGb = 50;
  const { error } = await supabaseAdmin.from("entitlements").upsert(
    {
      user_id: userId,
      plan: "standard",
      status: "active",
      entitlement_source: "stripe",
      stripe_customer_id: details.customerId ?? "",
      stripe_subscription_id: details.subscriptionId ?? "",
      stripe_plan_price_id: details.priceId ?? "",
      plan_lookup_key: details.lookupKey ?? "asset_safe_monthly",
      subscription_status: "active",
      base_storage_gb: baseStorageGb,
      source_event_id: sourceEventId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) throw new Error(`entitlement_upsert_failed: ${error.message}`);
}

async function applyStorageAddon(
  supabaseAdmin: any,
  userId: string,
  details: ReturnType<typeof extractSessionDetails>,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  // Must have an active base entitlement with matching customer id.
  const { data: ent } = await supabaseAdmin
    .from("entitlements")
    .select("status, stripe_customer_id, storage_addon_blocks_qty")
    .eq("user_id", userId)
    .maybeSingle();
  if (!ent || !["active", "trialing"].includes(ent.status)) {
    return { ok: false, reason: "no_active_base_entitlement" };
  }
  if (!ent.stripe_customer_id || ent.stripe_customer_id !== details.customerId) {
    return { ok: false, reason: "customer_id_mismatch" };
  }
  const nextQty = (ent.storage_addon_blocks_qty ?? 0) + 1;
  const { error } = await supabaseAdmin
    .from("entitlements")
    .update({
      storage_addon_blocks_qty: nextQty,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);
  if (error) return { ok: false, reason: `update_failed:${error.message}` };
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Consent
// ---------------------------------------------------------------------------

async function recordConsent(
  supabaseAdmin: any,
  email: string,
  details: ReturnType<typeof extractSessionDetails>,
) {
  // Server-resolved canonical version.
  const { data: terms } = await supabaseAdmin
    .from("legal_terms_versions")
    .select("current_version")
    .eq("is_active", true)
    .order("effective_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const serverVersion = terms?.current_version ?? details.currentTermsVersion ?? "v1.0";

  try {
    await supabaseAdmin.from("user_consents").insert({
      user_email: email,
      consent_type: "post_payment_terms",
      terms_version: serverVersion,
    });
  } catch (err) {
    log("Consent insert failed (non-fatal)", { err: (err as Error).message });
  }
}

// ---------------------------------------------------------------------------
// Main entry
// ---------------------------------------------------------------------------

export async function fulfillCheckout(
  stripe: Stripe,
  supabaseAdmin: any,
  session: Stripe.Checkout.Session,
  opts: {
    source: FulfillmentSource;
    sourceEventId?: string;
    origin?: string;
    adminOverride?: AdminOverrideContext;
  },
): Promise<FulfillmentResult> {
  const details = extractSessionDetails(session);
  log("Begin fulfillment", {
    sessionId: session.id,
    source: opts.source,
    lookupKey: details.lookupKey,
    email: details.email,
    metadataUserId: details.metadataUserId,
    adminOverride: !!opts.adminOverride,
  });

  // Guards
  if (session.payment_status !== "paid") {
    return { status: "rejected", reason: "not_paid" };
  }
  if (session.mode !== "subscription") {
    return { status: "rejected", reason: "wrong_mode" };
  }
  if (!details.lookupKey || !ALLOWED_LOOKUP_KEYS.has(details.lookupKey)) {
    return { status: "rejected", reason: "unknown_lookup_key" };
  }
  if (!details.email) {
    return { status: "rejected", reason: "missing_email" };
  }

  // 1. Claim row
  const claim = await claimFulfillmentRow(supabaseAdmin, session, opts.source, details);
  if (claim.kind === "already_done") {
    return { status: "already_done", fulfillment_id: claim.id };
  }
  if (claim.kind === "in_progress") {
    return { status: "in_progress", fulfillment_id: claim.id };
  }
  const fulfillmentId = claim.id;

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  try {
    const isStorageAddon = ALLOWED_STORAGE_LOOKUP_KEYS.has(details.lookupKey);

    // ----------------- USER RESOLUTION -----------------
    let resolvedUserId: string | null = null;
    let resolvedEmail = details.email;

    if (opts.adminOverride) {
      // Admin override path — re-verify override user.
      const overrideId = opts.adminOverride.override_user_id;
      const { data: ovrUser, error: ovrErr } = await supabaseAdmin.auth.admin.getUserById(overrideId);
      if (ovrErr || !ovrUser?.user) {
        return { status: "rejected", reason: "override_user_not_found" };
      }
      const ovrEmail = (ovrUser.user.email || "").toLowerCase();
      const emailMatches = ovrEmail === details.email;
      const reason = (opts.adminOverride.override_reason ?? "").trim();
      if (!emailMatches && reason.length < 20) {
        return { status: "rejected", reason: "override_reason_required" };
      }
      resolvedUserId = ovrUser.user.id;
      resolvedEmail = ovrEmail || details.email;
    } else if (details.metadataUserId) {
      // Verified ownership path.
      const { data: claimedUser } = await supabaseAdmin.auth.admin.getUserById(details.metadataUserId);
      if (!claimedUser?.user) {
        return await markManualReview(supabaseAdmin, fulfillmentId, "metadata_user_not_found");
      }
      const claimedEmail = (claimedUser.user.email || "").toLowerCase();
      if (claimedEmail !== details.email) {
        // Allow if existing entitlement has matching customer id.
        const { data: ent } = await supabaseAdmin
          .from("entitlements")
          .select("stripe_customer_id")
          .eq("user_id", details.metadataUserId)
          .maybeSingle();
        if (!ent?.stripe_customer_id || ent.stripe_customer_id !== details.customerId) {
          return await markManualReview(
            supabaseAdmin,
            fulfillmentId,
            `email_mismatch:${claimedEmail}_vs_${details.email}`,
          );
        }
      }
      resolvedUserId = claimedUser.user.id;
    } else {
      // No metadata.user_id — base plans only (anonymous checkout).
      if (isStorageAddon) {
        return await markManualReview(
          supabaseAdmin,
          fulfillmentId,
          "storage_addon_without_user_id",
        );
      }

      if (await isDeletedAccountEmail(supabaseAdmin, details.email)) {
        await supabaseAdmin
          .from("checkout_fulfillments")
          .update({
            status: "rejected",
            manual_review_reason: "deleted_account_email_blocked",
            completed_at: new Date().toISOString(),
          })
          .eq("id", fulfillmentId);
        return { status: "rejected", reason: "deleted_account_email_blocked" };
      }

      // Try create user; fall back to filtered lookup on 422.
      const nameParts = (details.customerName || "").split(" ");
      const firstName = nameParts[0] || null;
      const lastName = nameParts.slice(1).join(" ") || null;

      const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email: details.email,
        email_confirm: true,
        user_metadata: { first_name: firstName, last_name: lastName },
      });
      if (!createErr && created?.user) {
        resolvedUserId = created.user.id;
      } else if (
        createErr?.message?.includes("already been registered") ||
        (createErr as any)?.status === 422
      ) {
        const existing = await adminFetchUserByEmail(supabaseUrl, serviceRoleKey, details.email);
        if (!existing) {
          return await markManualReview(
            supabaseAdmin,
            fulfillmentId,
            "user_lookup_failed_after_422",
          );
        }
        resolvedUserId = existing.id;
      } else {
        throw new Error(`user_creation_failed: ${createErr?.message}`);
      }
    }

    if (!resolvedUserId) {
      return await markManualReview(supabaseAdmin, fulfillmentId, "user_unresolved");
    }

    // ----------------- WRITE PATH -----------------
    if (isStorageAddon) {
      const res = await applyStorageAddon(supabaseAdmin, resolvedUserId, details);
      if (!res.ok) {
        return await markManualReview(supabaseAdmin, fulfillmentId, res.reason);
      }
      await supabaseAdmin
        .from("checkout_fulfillments")
        .update({
          status: "fulfilled",
          user_id: resolvedUserId,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", fulfillmentId);
      return { status: "fulfilled", user_id: resolvedUserId, fulfillment_id: fulfillmentId };
    }

    // Base plan: workspace + entitlement + consent + magic link
    const nameParts = (details.customerName || "").split(" ");
    const firstName = nameParts[0] || null;
    const lastName = nameParts.slice(1).join(" ") || null;

    await upsertBaseEntitlement(
      supabaseAdmin,
      resolvedUserId,
      details,
      opts.sourceEventId ?? `${opts.source}:${session.id}`,
    );
    await ensureWorkspace(supabaseAdmin, resolvedUserId, resolvedEmail, firstName, lastName);
    await recordConsent(supabaseAdmin, resolvedEmail, details);

    // Skip magic link for admin override (user already exists, may already be signed in).
    let emailResult: { ok: true } | { ok: false; error: string } = { ok: true };
    if (!opts.adminOverride) {
      emailResult = await sendMagicLink(
        supabaseAdmin,
        resolvedEmail,
        opts.origin ?? "https://getassetsafe.com",
      );
    }

    if (emailResult.ok) {
      await supabaseAdmin
        .from("checkout_fulfillments")
        .update({
          status: "fulfilled",
          user_id: resolvedUserId,
          magic_link_sent_at: new Date().toISOString(),
          magic_link_delivery_status: opts.adminOverride ? "skipped_admin" : "sent",
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", fulfillmentId);
      return { status: "fulfilled", user_id: resolvedUserId, fulfillment_id: fulfillmentId };
    } else {
      await supabaseAdmin
        .from("checkout_fulfillments")
        .update({
          status: "fulfilled_email_failed",
          user_id: resolvedUserId,
          magic_link_delivery_status: "failed",
          last_email_error: emailResult.error,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", fulfillmentId);
      return {
        status: "fulfilled_email_failed",
        user_id: resolvedUserId,
        fulfillment_id: fulfillmentId,
        error: emailResult.error,
      };
    }
  } catch (err) {
    const msg = (err as Error).message;
    log("Fulfillment threw — marking failed_retryable", { msg, fulfillmentId });
    await supabaseAdmin
      .from("checkout_fulfillments")
      .update({
        status: "failed_retryable",
        last_email_error: msg.slice(0, 500),
        updated_at: new Date().toISOString(),
      })
      .eq("id", fulfillmentId);
    return { status: "failed_retryable", error: msg };
  }
}
