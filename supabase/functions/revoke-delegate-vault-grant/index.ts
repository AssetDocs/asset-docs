// Revokes a delegate vault grant. Only the locker owner can revoke. Marks the
// grant row status='revoked' and stamps revoked_at.
//
// Note: this does NOT rotate the underlying vault key. A delegate who already
// decrypted and exfiltrated material before revocation cannot be retroactively
// blocked from that copy. Full key rotation is a separate step.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Body {
  grantId?: string;
  legacyLockerId?: string;
  delegateUserId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      },
    );
    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const body = (await req.json()) as Body;
    let query = admin
      .from("vault_delegate_grants")
      .update({ status: "revoked", revoked_at: new Date().toISOString() })
      .eq("owner_user_id", user.id)
      .eq("status", "active");

    if (body.grantId) {
      query = query.eq("id", body.grantId);
    } else if (body.legacyLockerId && body.delegateUserId) {
      query = query
        .eq("legacy_locker_id", body.legacyLockerId)
        .eq("delegate_user_id", body.delegateUserId);
    } else {
      return new Response(
        JSON.stringify({
          error: "Provide grantId or (legacyLockerId + delegateUserId)",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

    const { data, error } = await query.select("id");
    if (error) {
      console.error("revoke-delegate-vault-grant error:", error);
      return new Response(JSON.stringify({ error: "Failed to revoke" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(
      JSON.stringify({ success: true, revokedCount: data?.length ?? 0 }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      },
    );
  } catch (err: any) {
    console.error("revoke-delegate-vault-grant exception:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
