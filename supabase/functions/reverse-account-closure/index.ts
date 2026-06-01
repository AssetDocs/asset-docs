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

    const { data: pending } = await supabase
      .from('account_closure_requests')
      .select('id')
      .eq('owner_user_id', userId)
      .in('status', ['pending', 'scheduled'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!pending) throw new Error("No active closure request to reverse");

    const { error: updErr } = await supabase
      .from('account_closure_requests')
      .update({ status: 'reversed', reversed_at: new Date().toISOString() })
      .eq('id', pending.id);
    if (updErr) throw updErr;

    // Restore account status (best-effort: back to cancelled_billing_active if billing still cancelling, else active)
    await supabase
      .from('profiles')
      .update({ account_status: 'cancelled_billing_active', updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'unknown error' }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
