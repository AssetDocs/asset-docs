/**
 * secure-delete-file — Recoverable, server-side deletion of a DB row + its
 * paired storage object. Uses a processing lease to serialize concurrent
 * callers without blocking legitimate retries after a storage failure.
 *
 * Flow:
 *   1. Authenticate caller (JWT).
 *   2. Look up row by hard-coded resource → table mapping.
 *   3. Authorize:
 *        - Shared resources (property_file, user_document): owner-only via
 *          has_account_access(caller, row.user_id, 'owner').
 *        - Owner-only resources: caller must be row.user_id.
 *   4. Atomically claim the row by setting a processing lease.
 *        - Claim succeeds when not currently leased (or lease > 10 min old).
 *        - Loser receives 409 { code: 'in_progress', retryable: true }.
 *   5. Remove storage object using the path captured on the row.
 *        - "Not found" → idempotent success.
 *        - Failure → release lease, keep pending_delete + path + error,
 *          return 409 { code: 'storage_remove_failed', retryable: true }.
 *   6. Delete the DB row.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type Ownership = "shared_owner" | "owner_only";

interface ResourceDef {
  table: string;
  bucket: string | "from_row";
  pathColumn: string;
  ownership: Ownership;
  pathNullable?: boolean;
  /** Owner-facing label for the cleanup list. */
  label: string;
  /** Column to read for a display name (best-effort). */
  labelColumn?: string;
}

const RESOURCES: Record<string, ResourceDef> = {
  property_file: {
    table: "property_files",
    bucket: "from_row",
    pathColumn: "file_path",
    ownership: "shared_owner",
    label: "Property file",
    labelColumn: "file_name",
  },
  user_document: {
    table: "user_documents",
    bucket: "documents",
    pathColumn: "file_path",
    ownership: "shared_owner",
    label: "Document",
    labelColumn: "file_name",
  },
  memory_safe_item: {
    table: "memory_safe_items",
    bucket: "memory-safe",
    pathColumn: "file_path",
    ownership: "owner_only",
    label: "Memory Safe item",
    labelColumn: "file_name",
  },
  family_recipe_attachment: {
    table: "family_recipes",
    bucket: "from_row",
    pathColumn: "file_path",
    ownership: "owner_only",
    pathNullable: true,
    label: "Recipe attachment",
    labelColumn: "title",
  },
  notes_tradition_attachment: {
    table: "notes_traditions",
    bucket: "from_row",
    pathColumn: "file_path",
    ownership: "owner_only",
    pathNullable: true,
    label: "Notes / tradition attachment",
    labelColumn: "title",
  },
  contact_attachment: {
    table: "vip_contact_attachments",
    bucket: "contact-attachments",
    pathColumn: "file_path",
    ownership: "owner_only",
    label: "Contact attachment",
    labelColumn: "file_name",
  },
  paint_code_swatch: {
    table: "paint_codes",
    bucket: "photos",
    pathColumn: "swatch_image_path",
    ownership: "owner_only",
    pathNullable: true,
    label: "Paint code swatch",
    labelColumn: "name",
  },
};

export { RESOURCES };

const LEASE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

const bodySchema = z.object({
  resource: z.string().min(1),
  id: z.string().uuid(),
});

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isNotFoundStorageError(
  err: { message?: string; statusCode?: string | number } | null,
): boolean {
  if (!err) return false;
  const msg = (err.message || "").toLowerCase();
  const code = String(err.statusCode ?? "");
  return (
    code === "404" ||
    msg.includes("not found") ||
    msg.includes("object does not exist") ||
    msg.includes("not_found")
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return json(400, { error: "invalid_request" });
    const { resource, id } = parsed.data;
    const def = RESOURCES[resource];
    if (!def) return json(400, { error: "unknown_resource" });

    // --- Authenticate caller ----------------------------------------------
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

    const admin = createClient(supabaseUrl, serviceKey);

    // --- Fetch row (service role bypasses RLS / restrictive policies) -----
    const { data: row, error: rowErr } = await admin
      .from(def.table)
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (rowErr) {
      console.error("secure-delete-file: row fetch error", {
        resource,
        id,
        err: rowErr.message,
      });
      return json(500, { error: "lookup_failed" });
    }
    if (!row) return json(404, { error: "not_found" });

    const rowUserId = row.user_id as string | null;
    if (!rowUserId) {
      console.error("secure-delete-file: row missing user_id", { resource, id });
      return json(500, { error: "invalid_row" });
    }

    // --- Authorize --------------------------------------------------------
    if (def.ownership === "owner_only") {
      if (rowUserId !== callerId) return json(403, { error: "forbidden" });
    } else {
      // shared_owner: caller must hold the 'owner' role on the account that
      // owns this row. Full Access and Read Only AUs are rejected. Reuses
      // the project-standard helper for consistency with table RLS.
      const { data: allowed, error: rpcErr } = await admin.rpc(
        "has_account_access",
        {
          _user_id: callerId,
          _owner_user_id: rowUserId,
          _min_role: "owner",
        },
      );
      if (rpcErr) {
        console.error("secure-delete-file: has_account_access failed", {
          resource,
          id,
          err: rpcErr.message,
        });
        return json(500, { error: "authz_failed" });
      }
      if (!allowed) return json(403, { error: "forbidden" });
    }

    // --- Atomic claim via processing lease --------------------------------
    // Allowed to claim when:
    //   (a) not pending at all, OR
    //   (b) pending but no active lease, OR
    //   (c) lease is older than LEASE_TIMEOUT_MS (stale, presumed crashed).
    const staleBefore = new Date(Date.now() - LEASE_TIMEOUT_MS).toISOString();
    const nowIso = new Date().toISOString();
    const nextAttempts = (row.delete_attempts ?? 0) + 1;

    const { data: claimed, error: claimErr } = await admin
      .from(def.table)
      .update({
        pending_delete: true,
        pending_delete_at: row.pending_delete_at ?? nowIso,
        delete_processing_at: nowIso,
        delete_attempts: nextAttempts,
        delete_error: null,
      })
      .eq("id", id)
      .or(
        `pending_delete.eq.false,delete_processing_at.is.null,delete_processing_at.lt.${staleBefore}`,
      )
      .select("id")
      .maybeSingle();

    if (claimErr) {
      console.error("secure-delete-file: claim failed", {
        resource,
        id,
        err: claimErr.message,
      });
      return json(500, { error: "claim_failed" });
    }
    if (!claimed) {
      // Another invocation holds an active lease.
      return json(409, { error: "in_progress", retryable: true });
    }

    // --- Resolve bucket + path -------------------------------------------
    const bucket =
      def.bucket === "from_row" ? (row.bucket_name as string | null) : def.bucket;
    const path = row[def.pathColumn] as string | null;
    const hasPath = !!path && !!bucket;

    // Helper: release the lease so the row is immediately retryable.
    const releaseLease = async (errMessage: string | null) => {
      await admin
        .from(def.table)
        .update({
          delete_processing_at: null,
          delete_error: errMessage ? errMessage.slice(0, 500) : null,
        })
        .eq("id", id);
    };

    // --- Remove storage object -------------------------------------------
    if (hasPath) {
      const { error: storageErr } = await admin.storage
        .from(bucket!)
        .remove([path!]);
      if (storageErr && !isNotFoundStorageError(storageErr)) {
        const errMsg = storageErr.message || "storage_error";
        console.error("secure-delete-file: storage remove failed", {
          resource,
          id,
          bucket,
          err: errMsg,
        });
        await releaseLease(errMsg);
        return json(409, {
          error: "storage_remove_failed",
          retryable: true,
        });
      }
    } else if (!def.pathNullable) {
      console.warn("secure-delete-file: missing path on non-nullable resource", {
        resource,
        id,
      });
    }

    // --- Delete the DB row (must still be the leased pending row) --------
    const { error: delErr, count } = await admin
      .from(def.table)
      .delete({ count: "exact" })
      .eq("id", id)
      .eq("pending_delete", true);

    if (delErr) {
      console.error("secure-delete-file: db delete failed", {
        resource,
        id,
        err: delErr.message,
      });
      await releaseLease(`db_delete: ${delErr.message}`);
      return json(409, { error: "db_delete_failed", retryable: true });
    }
    if (!count) {
      // Row vanished or pending flag was cleared by another path.
      console.warn("secure-delete-file: row not deleted (count=0)", { resource, id });
    }

    return json(200, { ok: true });
  } catch (e) {
    console.error("secure-delete-file: unhandled", e);
    return json(500, { error: "internal_error" });
  }
});
