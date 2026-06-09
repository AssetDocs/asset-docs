// Issues a delegate vault grant after server-side validation.
// Owner calls this from the client with a pre-wrapped vault key (wrapped under
// the delegate's public key client-side). This function:
//   - Verifies the caller is the locker owner.
//   - Verifies the target delegate has an acknowledged recovery request.
//   - Verifies the delegate has a public key on file and its key_version matches.
//   - Inserts a row in vault_delegate_grants (service-role only inserts).
//
// Idempotency: if an active grant already exists for (locker, delegate), the
// existing row is updated with the new wrapped key and version.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Body {
  legacyLockerId: string;
  delegateUserId: string;
  wrappedVaultKey: string; // base64 RSA-OAEP(vault key) under delegate public key
  delegateKeyVersion: number;
  recoveryRequestId?: string | null;
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
    const {
      legacyLockerId,
      delegateUserId,
      wrappedVaultKey,
      delegateKeyVersion,
      recoveryRequestId,
    } = body ?? {};

    if (
      !legacyLockerId ||
      !delegateUserId ||
      !wrappedVaultKey ||
      typeof delegateKeyVersion !== "number"
    ) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Verify caller owns the locker
    const { data: locker, error: lockerErr } = await admin
      .from("legacy_locker")
      .select("id, user_id")
      .eq("id", legacyLockerId)
      .maybeSingle();
    if (lockerErr || !locker) {
      return new Response(JSON.stringify({ error: "Locker not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    if (locker.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Not the locker owner" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Verify there is an acknowledged recovery request for this delegate
    const { data: rec } = await admin
      .from("recovery_requests")
      .select("id, status, delegate_user_id, legacy_locker_id")
      .eq("legacy_locker_id", legacyLockerId)
      .eq("delegate_user_id", delegateUserId)
      .in("status", ["acknowledged", "approved"])
      .order("requested_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!rec) {
      return new Response(
        JSON.stringify({
          error: "No acknowledged/approved recovery request for this delegate",
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

    // Verify delegate has a key on file with the claimed version
    const { data: kp } = await admin
      .from("vault_delegate_keypairs")
      .select("user_id, key_version")
      .eq("user_id", delegateUserId)
      .maybeSingle();
    if (!kp) {
      return new Response(
        JSON.stringify({ error: "Delegate has no public key on file" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }
    if (kp.key_version !== delegateKeyVersion) {
      return new Response(
        JSON.stringify({
          error: "Delegate key version mismatch; refresh and retry",
        }),
        {
          status: 409,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

    // Upsert: revoke any prior active grant, then insert the new one.
    await admin
      .from("vault_delegate_grants")
      .update({ status: "revoked", revoked_at: new Date().toISOString() })
      .eq("legacy_locker_id", legacyLockerId)
      .eq("delegate_user_id", delegateUserId)
      .eq("status", "active");

    const { data: inserted, error: insertErr } = await admin
      .from("vault_delegate_grants")
      .insert({
        legacy_locker_id: legacyLockerId,
        owner_user_id: user.id,
        delegate_user_id: delegateUserId,
        wrapped_vault_key: wrappedVaultKey,
        delegate_key_version: delegateKeyVersion,
        recovery_request_id: recoveryRequestId ?? rec.id,
        status: "active",
      })
      .select("id")
      .single();

    if (insertErr) {
      console.error("issue-delegate-vault-grant insert error:", insertErr);
      return new Response(
        JSON.stringify({ error: "Failed to issue grant" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

    return new Response(JSON.stringify({ success: true, id: inserted.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err: any) {
    console.error("issue-delegate-vault-grant error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
