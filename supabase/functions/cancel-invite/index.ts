/**
 * cancel-invite — Owner-only. Marks a pending invite as canceled. Idempotent.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { checkAuRateLimit } from "../_shared/au-rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const bodySchema = z.object({ inviteId: z.string().uuid() });

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

    const parsed = bodySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return json({ error: "Invalid input.", success: false }, 400);
    const { inviteId } = parsed.data;

    const { data: invite } = await admin
      .from("invites")
      .select("id, account_id, email, status")
      .eq("id", inviteId)
      .maybeSingle();
    if (!invite) return json({ error: "Invitation not found.", success: false }, 404);

    const { data: isOwner } = await admin.rpc("is_account_owner", { _user_id: user.id, _account_id: invite.account_id });
    if (!isOwner) return json({ error: "You must be the account owner.", success: false }, 403);

    const rl = await checkAuRateLimit(`account:${invite.account_id}`, "cancel-invite", { maxAttempts: 30, windowMinutes: 60 });
    if (!rl.allowed) return json({ error: rl.message, success: false }, 429);

    if (invite.status !== "pending") return json({ success: true, already: true });

    await admin.from("invites").update({ status: "canceled", canceled_at: new Date().toISOString() }).eq("id", inviteId);

    try {
      await admin.from("user_activity_logs").insert({
        user_id: user.id,
        actor_user_id: user.id,
        action_type: "invite_canceled",
        action_category: "authorized_users",
        resource_type: "invite",
        resource_name: invite.email,
        details: { invite_id: inviteId },
      });
    } catch (e) { console.error("[CANCEL-INVITE] log error:", e); }

    return json({ success: true });
  } catch (e) {
    console.error("[CANCEL-INVITE] Unhandled:", e);
    return json({ error: "Failed to cancel invitation.", success: false }, 500);
  }
});
