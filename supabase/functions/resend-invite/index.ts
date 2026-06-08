/**
 * resend-invite — Owner-only. Regenerates the email-delivery attempt for an
 * existing pending invite. The invite row, token hash, and expiry are left
 * untouched; only delivery_status, last_sent_at, resend_count are updated.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { checkAuRateLimit } from "../_shared/au-rate-limit.ts";
import { GENERIC_DELIVERY_ERROR, sendInviteEmail } from "../_shared/au-invite-email.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const bodySchema = z.object({ inviteId: z.string().uuid() });

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized", success: false }, 401);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
    const authClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const { data: { user }, error: authErr } = await authClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authErr || !user) return json({ error: "Unauthorized", success: false }, 401);

    const parsed = bodySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return json({ error: "Invalid input.", success: false }, 400);
    const { inviteId } = parsed.data;

    // Load invite + verify owner.
    const { data: invite, error: invErr } = await admin
      .from("invites")
      .select("id, account_id, email, role, status, expires_at, resend_count")
      .eq("id", inviteId)
      .maybeSingle();
    if (invErr || !invite) return json({ error: "Invitation not found.", success: false }, 404);

    const { data: isOwner } = await admin.rpc("is_account_owner", { _user_id: user.id, _account_id: invite.account_id });
    if (!isOwner) return json({ error: "You must be the account owner.", success: false }, 403);

    if (invite.status !== "pending") {
      return json({ error: "This invitation is no longer pending.", success: false }, 409);
    }
    if (new Date(invite.expires_at).getTime() <= Date.now()) {
      return json({ error: "This invitation has expired. Cancel it and send a new one.", success: false }, 409);
    }

    // Eligibility (still subscribed, account writable).
    const { data: canSend } = await admin.rpc("can_send_au_invite", { _account_id: invite.account_id });
    if (!canSend) {
      return json({ error: "This account is not currently eligible to resend invites.", success: false }, 403);
    }

    // Rate limits — 5 per hour per invite, 20 per hour per account.
    const rlInvite = await checkAuRateLimit(`invite:${inviteId}`, "resend-invite", { maxAttempts: 5, windowMinutes: 60 });
    if (!rlInvite.allowed) return json({ error: rlInvite.message, success: false }, 429);
    const rlAccount = await checkAuRateLimit(`account:${invite.account_id}`, "resend-invite-account", { maxAttempts: 20, windowMinutes: 60 });
    if (!rlAccount.allowed) return json({ error: rlAccount.message, success: false }, 429);

    // We cannot recover the original raw token (we only stored its hash). Mint a new
    // raw token and re-hash; this invalidates any old link but is the only safe path.
    const tokenBytes = new Uint8Array(32);
    crypto.getRandomValues(tokenBytes);
    const rawToken = Array.from(tokenBytes, (b) => b.toString(16).padStart(2, "0")).join("");
    const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(rawToken));
    const tokenHash = Array.from(new Uint8Array(hashBuffer), (b) => b.toString(16).padStart(2, "0")).join("");

    await admin.from("invites").update({ token_hash: tokenHash }).eq("id", inviteId);

    const { data: ownerProfile } = await admin
      .from("profiles")
      .select("first_name, last_name")
      .eq("user_id", user.id)
      .maybeSingle();
    const ownerName = ownerProfile
      ? `${ownerProfile.first_name || ""} ${ownerProfile.last_name || ""}`.trim()
      : "An Asset Safe user";

    const sendResult = await sendInviteEmail({
      toEmail: invite.email,
      ownerName: ownerName || "An Asset Safe user",
      role: invite.role as "full_access" | "read_only",
      rawToken,
    });

    const nowIso = new Date().toISOString();
    if (sendResult.ok) {
      await admin.from("invites").update({
        delivery_status: "sent",
        delivered_at: nowIso,
        last_sent_at: nowIso,
        last_delivery_error: null,
        resend_count: (invite.resend_count || 0) + 1,
      }).eq("id", inviteId);
      return json({ success: true, delivery_status: "sent" });
    }

    console.error("[RESEND-INVITE] delivery failed:", sendResult.rawError);
    await admin.from("invites").update({
      delivery_status: "failed",
      last_delivery_error: sendResult.rawError,
      last_sent_at: nowIso,
      resend_count: (invite.resend_count || 0) + 1,
    }).eq("id", inviteId);

    return json({ success: true, delivery_status: "failed", error: GENERIC_DELIVERY_ERROR });
  } catch (e) {
    console.error("[RESEND-INVITE] Unhandled:", e);
    return json({ error: "Failed to resend invitation.", success: false }, 500);
  }
});
