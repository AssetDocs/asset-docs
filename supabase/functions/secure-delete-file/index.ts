/**
 * secure-delete-file — Recoverable, server-side deletion of a DB row + its
 * paired storage object.
 *
 * Flow:
 *   1. Authenticate caller (JWT).
 *   2. Look up row by hard-coded resource → table mapping (client never names
 *      a table or bucket).
 *   3. Authorize:
 *        - Shared resources: caller must have an active membership in the
 *          account owned by row.user_id, with role owner or full_access.
 *        - Owner-only resources: caller must be row.user_id.
 *   4. Mark row pending_delete (so list/detail views hide it).
 *   5. Remove storage object using the path captured on the row.
 *        - "Not found" → idempotent success.
 *        - Other failure → keep pending_delete row + path, return 409.
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

type Ownership = "shared" | "owner_only";

interface ResourceDef {
  table: string;
  bucket: string | "from_row"; // "from_row" => read bucket_name column off the row
  pathColumn: string;
  ownership: Ownership;
  pathNullable?: boolean;
}

const RESOURCES: Record<string, ResourceDef> = {
  property_file: {
    table: "property_files",
    bucket: "from_row",
    pathColumn: "file_path",
    ownership: "shared",
  },
  user_document: {
    table: "user_documents",
    bucket: "documents",
    pathColumn: "file_path",
    ownership: "shared",
  },
  memory_safe_item: {
    table: "memory_safe_items",
    bucket: "memory-safe",
    pathColumn: "file_path",
    ownership: "owner_only",
  },
  family_recipe_attachment: {
    table: "family_recipes",
    bucket: "from_row",
    pathColumn: "file_path",
    ownership: "owner_only",
    pathNullable: true,
  },
  notes_tradition_attachment: {
    table: "notes_traditions",
    bucket: "from_row",
    pathColumn: "file_path",
    ownership: "owner_only",
    pathNullable: true,
  },
  contact_attachment: {
    table: "vip_contact_attachments",
    bucket: "contact-attachments",
    pathColumn: "file_path",
    ownership: "owner_only",
  },
  paint_code_swatch: {
    table: "paint_codes",
    bucket: "photos",
    pathColumn: "swatch_image_path",
    ownership: "owner_only",
    pathNullable: true,
  },
};

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

function isNotFoundStorageError(err: { message?: string; statusCode?: string | number } | null): boolean {
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
    // --- Parse + validate input -------------------------------------------
    const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return json(400, { error: "invalid_request" });
    }
    const { resource, id } = parsed.data;
    const def = RESOURCES[resource];
    if (!def) {
      return json(400, { error: "unknown_resource" });
    }

    // --- Authenticate caller ---------------------------------------------
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
    if (userErr || !userData?.user) {
      return json(401, { error: "invalid_auth" });
    }
    const callerId = userData.user.id;

    const admin = createClient(supabaseUrl, serviceKey);

    // --- Fetch row (bypasses RLS so we can read pending_delete rows too) --
    const { data: row, error: rowErr } = await admin
      .from(def.table)
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (rowErr) {
      console.error("secure-delete-file: row fetch error", { resource, id, err: rowErr.message });
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
      if (rowUserId !== callerId) {
        return json(403, { error: "forbidden" });
      }
    } else {
      // shared: row.user_id is the account owner; caller must be a member
      // of that account with owner or full_access role.
      const { data: account, error: accErr } = await admin
        .from("accounts")
        .select("id")
        .eq("owner_user_id", rowUserId)
        .maybeSingle();
      if (accErr || !account) {
        console.error("secure-delete-file: no account for owner", { resource, id, rowUserId });
        return json(403, { error: "forbidden" });
      }
      const { data: membership } = await admin
        .from("account_memberships")
        .select("role,status")
        .eq("account_id", account.id)
        .eq("user_id", callerId)
        .maybeSingle();
      if (
        !membership ||
        membership.status !== "active" ||
        !["owner", "full_access"].includes(membership.role)
      ) {
        return json(403, { error: "forbidden" });
      }
    }

    // --- Resolve bucket + path -------------------------------------------
    const bucket =
      def.bucket === "from_row" ? (row.bucket_name as string | null) : def.bucket;
    const path = row[def.pathColumn] as string | null;

    if (!def.bucket || (def.bucket === "from_row" && !bucket)) {
      // Bucket missing on a row that should have one — treat as DB-only delete.
      console.warn("secure-delete-file: missing bucket on row", { resource, id });
    }

    // --- Mark pending_delete (idempotent) --------------------------------
    if (!row.pending_delete) {
      const { error: markErr } = await admin
        .from(def.table)
        .update({
          pending_delete: true,
          pending_delete_at: new Date().toISOString(),
          delete_attempts: (row.delete_attempts ?? 0) + 1,
        })
        .eq("id", id);
      if (markErr) {
        console.error("secure-delete-file: mark pending failed", { resource, id, err: markErr.message });
        return json(500, { error: "mark_failed" });
      }
    } else {
      // retry: bump attempts
      await admin
        .from(def.table)
        .update({ delete_attempts: (row.delete_attempts ?? 0) + 1 })
        .eq("id", id);
    }

    // --- Remove storage object -------------------------------------------
    const hasPath = !!path && !!bucket;
    if (hasPath) {
      const { error: storageErr } = await admin.storage.from(bucket!).remove([path!]);
      if (storageErr && !isNotFoundStorageError(storageErr)) {
        const errMsg = storageErr.message || "storage_error";
        await admin
          .from(def.table)
          .update({ delete_error: errMsg.slice(0, 500) })
          .eq("id", id);
        console.error("secure-delete-file: storage remove failed", {
          resource,
          id,
          bucket,
          err: errMsg,
        });
        return json(409, { error: "storage_remove_failed", retryable: true });
      }
    } else if (!def.pathNullable) {
      console.warn("secure-delete-file: missing path on non-nullable resource", {
        resource,
        id,
      });
    }

    // --- Delete the DB row -----------------------------------------------
    const { error: delErr } = await admin
      .from(def.table)
      .delete()
      .eq("id", id)
      .eq("pending_delete", true);
    if (delErr) {
      console.error("secure-delete-file: db delete failed", { resource, id, err: delErr.message });
      await admin
        .from(def.table)
        .update({ delete_error: `db_delete: ${delErr.message}`.slice(0, 500) })
        .eq("id", id);
      return json(409, { error: "db_delete_failed", retryable: true });
    }

    return json(200, { ok: true });
  } catch (e) {
    console.error("secure-delete-file: unhandled", e);
    return json(500, { error: "internal_error" });
  }
});
