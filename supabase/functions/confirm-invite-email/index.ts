/**
 * confirm-invite-email — Auto-confirms a newly-signed-up invited user's email.
 * Security: only confirms when the raw invite token (sent to that mailbox) matches
 * a pending invite addressed to that exact email. Possession of the link proves
 * mailbox ownership, so requiring a second verification email is redundant.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const bodySchema = z.object({
  token: z.string().min(1).max(256),
  email: z.string().email().max(255),
});

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const body = await req.json();
    const { token, email } = bodySchema.parse(body);

    // Hash raw token
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(token));
    const tokenHash = Array.from(new Uint8Array(hashBuffer), (b) =>
      b.toString(16).padStart(2, "0"),
    ).join("");

    // Look up pending invite
    const { data: invite, error: inviteErr } = await supabaseAdmin
      .from("invites")
      .select("id, email, expires_at, status")
      .eq("token_hash", tokenHash)
      .maybeSingle();

    if (inviteErr || !invite) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid invitation token." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (invite.status !== "pending" || new Date(invite.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ success: false, error: "Invitation is no longer valid." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (invite.email.toLowerCase() !== email.toLowerCase()) {
      return new Response(
        JSON.stringify({ success: false, error: "Email does not match invitation." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Find the auth user by email and confirm them
    const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
    if (listErr) throw listErr;
    const authUser = list.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase(),
    );
    if (!authUser) {
      return new Response(
        JSON.stringify({ success: false, error: "User not found." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!authUser.email_confirmed_at) {
      const { error: updErr } = await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
        email_confirm: true,
      });
      if (updErr) throw updErr;
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("[CONFIRM-INVITE-EMAIL] Error:", error);
    const status = error instanceof z.ZodError ? 400 : 500;
    return new Response(
      JSON.stringify({ success: false, error: "Failed to confirm invite email." }),
      { status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
