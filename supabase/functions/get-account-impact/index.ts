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
      { auth: { persistSession: false } }
    );
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const { data: u, error } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (error || !u.user) throw new Error("Invalid token");
    const userId = u.user.id;

    const { data: account } = await supabase
      .from('accounts').select('id').eq('owner_user_id', userId).maybeSingle();
    const accountId = account?.id;

    const safeCount = async (table: string, col: string, val: string) => {
      try {
        const { count } = await supabase.from(table).select('id', { count: 'exact', head: true }).eq(col, val);
        return count ?? 0;
      } catch { return 0; }
    };

    const properties = accountId ? await safeCount('properties', 'account_id', accountId) : 0;
    const items = accountId ? await safeCount('items', 'account_id', accountId) : 0;
    const files = accountId ? await safeCount('property_files', 'account_id', accountId) : 0;
    let authorized_users = 0;
    if (accountId) {
      const { count } = await supabase
        .from('account_memberships').select('id', { count: 'exact', head: true })
        .eq('account_id', accountId).eq('status', 'active').neq('role', 'owner');
      authorized_users = count ?? 0;
    }

    const has_legacy_locker = !!(await supabase.from('legacy_locker').select('id').eq('user_id', userId).limit(1).maybeSingle()).data;
    const has_password_catalog = !!(await supabase.from('password_catalog').select('id').eq('user_id', userId).limit(1).maybeSingle()).data;

    return new Response(JSON.stringify({
      properties, items, files, authorized_users, has_legacy_locker, has_password_catalog,
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'unknown error' }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
