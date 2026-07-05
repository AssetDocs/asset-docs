/**
 * list-pending-file-deletions — Owner-only read of rows that are stuck in
 * pending_delete state across the in-scope tables. Returns ONLY safe fields
 * so an owner can retry a failed cleanup without exposing bucket paths or
 * raw provider error text.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type Source = {
  resource: string;
  table: string;
  label: string;
  labelColumn?: string;
  ownership: "shared_owner" | "owner_only";
};

// Mirrors secure-delete-file RESOURCES. Kept inline to avoid cross-function
// imports (Lovable edge functions live in single index.ts files).
const SOURCES: Source[] = [
  { resource: "property_file",              table: "property_files",          label: "Property file",              labelColumn: "file_name", ownership: "shared_owner" },
  { resource: "user_document",              table: "user_documents",          label: "Document",                   labelColumn: "file_name", ownership: "shared_owner" },
  { resource: "memory_safe_item",           table: "memory_safe_items",       label: "Memory Safe item",           labelColumn: "file_name", ownership: "owner_only" },
  { resource: "family_recipe_attachment",   table: "family_recipes",          label: "Recipe attachment",          labelColumn: "title",     ownership: "owner_only" },
  { resource: "family_medication_attachment", table: "family_medications",    label: "Medication attachment",      labelColumn: "medication_name", ownership: "shared_owner" },
  { resource: "notes_tradition_attachment", table: "notes_traditions",        label: "Notes / tradition attachment", labelColumn: "title",   ownership: "owner_only" },
  { resource: "contact_attachment",         table: "vip_contact_attachments", label: "Contact attachment",         labelColumn: "file_name", ownership: "owner_only" },
  { resource: "paint_code_swatch",          table: "paint_codes",             label: "Paint code swatch",          labelColumn: "name",      ownership: "owner_only" },
];

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
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

    const items: Array<{
      resource: string;
      id: string;
      label: string;
      display_name: string | null;
      pending_delete_at: string | null;
      delete_attempts: number;
      has_error: boolean;
      is_processing: boolean;
    }> = [];

    for (const src of SOURCES) {
      // Owner-only and shared resources alike: surface only rows whose
      // user_id matches the caller. (For shared resources this matches the
      // owner-only delete authorization.)
      const columns = [
        "id",
        "user_id",
        "pending_delete_at",
        "delete_attempts",
        "delete_error",
        "delete_processing_at",
        src.labelColumn,
      ]
        .filter(Boolean)
        .join(",");

      const { data, error } = await admin
        .from(src.table)
        .select(columns)
        .eq("user_id", callerId)
        .eq("pending_delete", true)
        .order("pending_delete_at", { ascending: false })
        .limit(200);

      if (error) {
        console.error("list-pending-file-deletions: query failed", {
          table: src.table,
          err: error.message,
        });
        continue;
      }

      for (const row of data ?? []) {
        items.push({
          resource: src.resource,
          id: row.id as string,
          label: src.label,
          display_name: src.labelColumn ? ((row as any)[src.labelColumn] ?? null) : null,
          pending_delete_at: (row as any).pending_delete_at ?? null,
          delete_attempts: (row as any).delete_attempts ?? 0,
          has_error: !!(row as any).delete_error,
          is_processing: !!(row as any).delete_processing_at,
        });
      }
    }

    items.sort((a, b) => {
      const ta = a.pending_delete_at ? Date.parse(a.pending_delete_at) : 0;
      const tb = b.pending_delete_at ? Date.parse(b.pending_delete_at) : 0;
      return tb - ta;
    });

    return json(200, { items });
  } catch (e) {
    console.error("list-pending-file-deletions: unhandled", e);
    return json(500, { error: "internal_error" });
  }
});
