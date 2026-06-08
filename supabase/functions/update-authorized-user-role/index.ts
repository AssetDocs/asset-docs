/**
 * update-authorized-user-role — Owner-only. Changes an Authorized User's role.
 * Cannot target the owner row. Logs activity and notifies the affected user.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { checkAuRateLimit } from "../_shared/au-rate-limit.ts";
import { sendAccessChangedEmail } from "../_shared/au-invite-email.ts";
import { requireStepUp, getClientIp } from "../_shared/mfa.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const bodySchema = z.object({
  membershipId: z.string().uuid(),
  role: z.enum(["full_access", "read_only"]),
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized", success: false }, 401);

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { autoRefreshToken: false, persistSession: false } });
    const authClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: { user }, error: authErr } = await authClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authErr || !user) return json({ error: "Unauthorized", success: false }, 401);

    // Role changes are sensitive — require active step-up if MFA enrolled.
    const gate = await requireStepUp(admin, user.id, {
      kind: 'update_authorized_user_role',
      ip: getClientIp(req),
      corsHeaders,
    });
    if (!gate.ok) return gate.response;

    const parsed = bodySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return json({ error: "Invalid input.", success: false }, 400);
    const { membershipId, role } = parsed.data;


    const { data: membership } = await admin
      .from("account_memberships")
      .select("id, account_id, user_id, role, status, email")
      .eq("id", membershipId)
      .maybeSingle();
    if (!membership) return json({ error: "Member not found.", success: false }, 404);
    if (membership.role === "owner") return json({ error: "Cannot change the owner role.", success: false }, 403);
    if (membership.status !== "active") return json({ error: "Member is not active.", success: false }, 409);

    const { data: isOwner } = await admin.rpc("is_account_owner", { _user_id: user.id, _account_id: membership.account_id });
    if (!isOwner) return json({ error: "You must be the account owner.", success: false }, 403);

    const rl = await checkAuRateLimit(`account:${membership.account_id}`, "update-role", { maxAttempts: 30, windowMinutes: 60 });
    if (!rl.allowed) return json({ error: rl.message, success: false }, 429);

    if (membership.role === role) return json({ success: true, already: true });

    await admin
      .from("account_memberships")
      .update({ role, role_changed_at: new Date().toISOString() })
      .eq("id", membershipId);

    try {
      await admin.from("user_activity_logs").insert({
        user_id: user.id,
        actor_user_id: user.id,
        action_type: "contributor_role_change",
        action_category: "authorized_users",
        resource_type: "account_membership",
        resource_name: membership.email || membership.user_id,
        details: { account_id: membership.account_id, from: membership.role, to: role },
      });
    } catch (e) { console.error("[UPDATE-ROLE] log error:", e); }

    // Notify the affected user (best-effort).
    if (membership.email) {
      const { data: ownerProfile } = await admin
        .from("profiles").select("first_name, last_name").eq("user_id", user.id).maybeSingle();
      const ownerName = ownerProfile ? `${ownerProfile.first_name || ""} ${ownerProfile.last_name || ""}`.trim() : "";
      sendAccessChangedEmail({ toEmail: membership.email, ownerName, action: "role_changed", newRole: role }).catch(() => {});
    }

    return json({ success: true });
  } catch (e) {
    console.error("[UPDATE-ROLE] Unhandled:", e);
    return json({ error: "Failed to update role.", success: false }, 500);
  }
});
