import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("missing_authorization");
    const { data: u, error: uerr } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (uerr || !u.user) throw new Error("invalid_token");
    const callerUserId = u.user.id;

    // Service role bypasses RLS, so we explicitly scope to the caller's
    // own properties (owner-authorized).
    const { data, error } = await supabase
      .from("properties")
      .select(
        "id, name, address, pending_delete_at, lease_expires_at, delete_attempts, last_delete_error",
      )
      .eq("user_id", callerUserId)
      .eq("pending_delete", true)
      .order("pending_delete_at", { ascending: true })
      .limit(200);

    if (error) throw error;

    const now = Date.now();
    const items = (data ?? []).map((row: any) => {
      const leaseExpiresAt = row.lease_expires_at
        ? new Date(row.lease_expires_at).getTime()
        : 0;
      const isProcessing = leaseExpiresAt > now;
      return {
        resource: "property",
        id: row.id,
        label: "Property",
        display_name: row.name || row.address || null,
        pending_delete_at: row.pending_delete_at,
        delete_attempts: row.delete_attempts ?? 0,
        has_error: !!row.last_delete_error,
        is_processing: isProcessing,
      };
    });

    return new Response(JSON.stringify({ items }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    const msg = e?.message || "unknown_error";
    const status =
      msg === "missing_authorization" || msg === "invalid_token" ? 401 : 500;
    return new Response(JSON.stringify({ error: msg }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
