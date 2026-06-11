/**
 * secure-delete-property — Owner-authorized, lease-coordinated property deletion.
 *
 * Flow:
 *   1. Verify caller JWT, capture callerUserId.
 *   2. Atomic claim via claim_property_deletion RPC (returns a unique lease
 *      token; works for both initial deletion and retry).
 *   3. Best-effort storage cleanup of property_files belonging to the property
 *      (lease is renewed during large batches).
 *   4. finalize_property_deletion RPC — verifies the lease, enables the guard
 *      GUC, and deletes the row. FK ON DELETE rules cascade children.
 *   5. On failure, release_property_deletion_lease records the error and
 *      leaves pending_delete=true so the cleanup queue can retry.
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const LEASE_TTL_SECONDS = 300; // 5 minutes
const LEASE_RENEW_EVERY = 50;  // renew every N files
const FILES_PAGE_SIZE = 200;

const bodySchema = z.object({ id: z.string().uuid() });

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  let propertyId: string | null = null;
  let leaseToken: string | null = null;
  let admin: ReturnType<typeof createClient> | null = null;

  try {
    const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return json(400, { error: "invalid_request" });
    propertyId = parsed.data.id;

    const authHeader = req.headers.get("Authorization") || "";
    const jwt = authHeader.replace(/^Bearer\s+/i, "");
    if (!jwt) return json(401, { error: "missing_auth" });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });
    const { data: userData, error: userErr } = await authClient.auth.getUser();
    if (userErr || !userData?.user) return json(401, { error: "invalid_auth" });
    const callerId = userData.user.id;

    admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    // --- Claim (atomic, scoped to caller) ---
    const { data: claimData, error: claimErr } = await admin.rpc(
      "claim_property_deletion",
      {
        p_property_id: propertyId,
        p_caller: callerId,
        p_lease_ttl_seconds: LEASE_TTL_SECONDS,
      },
    );
    if (claimErr) {
      console.error("secure-delete-property: claim error", claimErr.message);
      return json(500, { error: "claim_failed" });
    }
    leaseToken = (claimData as string | null) ?? null;
    if (!leaseToken) {
      // Either not owned by caller (no row updated) or another live lease holds it.
      // Distinguish: check existence under caller scope using service role.
      const { data: row } = await admin
        .from("properties")
        .select("id, user_id, lease_expires_at")
        .eq("id", propertyId)
        .maybeSingle();
      if (!row) return json(404, { error: "not_found" });
      if (row.user_id !== callerId) return json(403, { error: "forbidden" });
      return json(409, { error: "in_progress", retryable: true });
    }

    // --- Best-effort storage cleanup of property_files ---
    let processed = 0;
    while (true) {
      const { data: files, error: filesErr } = await admin
        .from("property_files")
        .select("id, file_path, bucket_name")
        .eq("property_id", propertyId)
        .eq("user_id", callerId)
        .limit(FILES_PAGE_SIZE);
      if (filesErr) {
        console.error("property_files lookup failed", filesErr.message);
        break; // proceed to finalize; orphaned objects can be GC'd later
      }
      if (!files || files.length === 0) break;

      // Group by bucket and remove
      const byBucket = new Map<string, string[]>();
      for (const f of files) {
        if (!f.file_path || !f.bucket_name) continue;
        const arr = byBucket.get(f.bucket_name) ?? [];
        arr.push(f.file_path);
        byBucket.set(f.bucket_name, arr);
      }
      for (const [bucket, paths] of byBucket) {
        const { error: rmErr } = await admin.storage.from(bucket).remove(paths);
        if (rmErr) {
          console.warn(`storage.remove ${bucket} partial failure:`, rmErr.message);
        }
      }
      processed += files.length;

      // Renew lease periodically during large batches
      if (processed % LEASE_RENEW_EVERY < FILES_PAGE_SIZE) {
        const { error: rnErr } = await admin.rpc(
          "renew_property_deletion_lease",
          { p_property_id: propertyId, p_lease_token: leaseToken,
            p_lease_ttl_seconds: LEASE_TTL_SECONDS },
        );
        if (rnErr) console.warn("lease renew failed:", rnErr.message);
      }

      if (files.length < FILES_PAGE_SIZE) break;
    }

    // --- Finalize: delete the property row (cascade handles children) ---
    const { data: finalized, error: finErr } = await admin.rpc(
      "finalize_property_deletion",
      { p_property_id: propertyId, p_lease_token: leaseToken },
    );
    if (finErr) {
      console.error("finalize failed:", finErr.message);
      await admin.rpc("release_property_deletion_lease", {
        p_property_id: propertyId,
        p_lease_token: leaseToken,
        p_error: `finalize: ${finErr.message}`,
      });
      return json(409, { error: "finalize_failed", retryable: true });
    }
    if (!finalized) {
      await admin.rpc("release_property_deletion_lease", {
        p_property_id: propertyId,
        p_lease_token: leaseToken,
        p_error: "finalize_returned_false",
      });
      return json(409, { error: "finalize_failed", retryable: true });
    }

    return json(200, { ok: true });
  } catch (e: any) {
    console.error("secure-delete-property: unhandled", e?.message ?? e);
    if (admin && propertyId && leaseToken) {
      try {
        await admin.rpc("release_property_deletion_lease", {
          p_property_id: propertyId,
          p_lease_token: leaseToken,
          p_error: `unhandled: ${e?.message ?? "unknown"}`,
        });
      } catch (_) { /* swallow */ }
    }
    return json(500, { error: "internal_error" });
  }
});
