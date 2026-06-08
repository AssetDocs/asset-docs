/**
 * accept-invite — Validates token, atomically creates/reactivates membership,
 * and marks the invite accepted. All state mutation happens inside the
 * accept_invite_atomic SECURITY DEFINER RPC in a single transaction.
 *
 * The verified Supabase user id and email are derived from the JWT here and
 * passed into the RPC — the RPC never reads auth.users.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { checkAuRateLimit } from "../_shared/au-rate-limit.ts";
import { sendInviteAcceptedOwnerEmail } from "../_shared/au-invite-email.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const bodySchema = z.object({
  token: z.string().min(1).max(256),
});

// Map RPC error codes to user-safe responses.
function mapRpcError(message: string): { status: number; error: string } {
  if (message.includes("invite_not_found")) {
    return { status: 400, error: "Invalid invitation token." };
  }
  if (message.includes("invite_already_used")) {
    return { status: 400, error: "This invitation has already been used." };
  }
  if (message.includes("invite_expired")) {
    return { status: 400, error: "This invitation has expired. Please request a new one." };
  }
  if (message.includes("invite_not_pending")) {
    return { status: 400, error: "This invitation is no longer valid." };
  }
  if (message.includes("email_mismatch")) {
    return { status: 403, error: "This invitation was sent to a different email address. Please sign in with the email the invite was sent to." };
  }
  if (message.includes("account_unavailable")) {
    return { status: 409, error: "This account is not currently able to add new members. Please contact the account owner." };
  }
  return { status: 500, error: "Failed to accept invitation." };
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    // 1) Verify the JWT — derive user.id and user.email from Supabase Auth.
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (authError || !user || !user.email) throw new Error("Unauthorized");

    // Rate limit: 10 accept attempts per hour per user (token guessing defense).
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rlUser = await checkAuRateLimit(`user:${user.id}`, "accept-invite", { maxAttempts: 10, windowMinutes: 60 });
    if (!rlUser.allowed) {
      return new Response(JSON.stringify({ error: rlUser.message, success: false }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const rlIp = await checkAuRateLimit(`ip:${ip}`, "accept-invite", { maxAttempts: 20, windowMinutes: 60 });
    if (!rlIp.allowed) {
      return new Response(JSON.stringify({ error: rlIp.message, success: false }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2) Hash the raw token.
    const body = await req.json();
    const { token } = bodySchema.parse(body);
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(token));
    const tokenHash = Array.from(new Uint8Array(hashBuffer), (b) => b.toString(16).padStart(2, "0")).join("");

    // 3) Atomic acceptance via SECURITY DEFINER RPC.
    const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc(
      "accept_invite_atomic",
      {
        _token_hash: tokenHash,
        _user_id: user.id,
        _user_email: user.email,
      },
    );

    if (rpcError) {
      console.error("[ACCEPT-INVITE] RPC error:", rpcError);
      const mapped = mapRpcError(rpcError.message || "");
      return new Response(JSON.stringify({ error: mapped.error, success: false }), {
        status: mapped.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4) Non-fatal: auto-confirm email for the invited user.
    if (!user.email_confirmed_at) {
      try {
        await supabaseAdmin.auth.admin.updateUserById(user.id, { email_confirm: true });
      } catch (e) {
        console.error("[ACCEPT-INVITE] Email auto-confirm failed (non-fatal):", e);
      }
    }

    const result = rpcResult as { account_id: string; role: string; success: boolean } | null;
    console.log("[ACCEPT-INVITE] Success:", { userId: user.id, accountId: result?.account_id, role: result?.role });

    // Non-fatal: notify owner.
    if (result?.account_id) {
      try {
        const { data: acct } = await supabaseAdmin
          .from("accounts").select("owner_user_id").eq("id", result.account_id).maybeSingle();
        if (acct?.owner_user_id) {
          const { data: { user: ownerUser } } = await supabaseAdmin.auth.admin.getUserById(acct.owner_user_id);
          if (ownerUser?.email) {
            sendInviteAcceptedOwnerEmail({
              toEmail: ownerUser.email,
              inviteeEmail: user.email!,
              role: result.role as "full_access" | "read_only",
            }).catch(() => {});
          }
        }
      } catch (e) {
        console.error("[ACCEPT-INVITE] owner notify failed (non-fatal):", e);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Invitation accepted. Welcome to Asset Safe.",
        account_id: result?.account_id,
        role: result?.role,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    console.error("[ACCEPT-INVITE] Error:", error);
    let message = "Failed to accept invitation.";
    let status = 500;
    if (error instanceof z.ZodError) {
      message = "Invalid input.";
      status = 400;
    }
    if (error.message === "Unauthorized") status = 401;
    return new Response(JSON.stringify({ error: message, success: false }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
