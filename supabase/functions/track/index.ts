import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { event, props, path, referrer, utm, occurred_at } = await req.json();

    // Try to resolve user from auth token if provided
    let user_id: string | null = null;
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const { data } = await supabase.auth.getUser(token);
      user_id = data.user?.id ?? null;
    }

    console.log('Tracking event:', { event, user_id, path });

    const { error } = await supabase.from("events").insert({
      user_id,
      event,
      props: props || {},
      path,
      referrer,
      utm,
      occurred_at: occurred_at || new Date().toISOString()
    });

    if (error) {
      console.error('Event tracking error:', error);
      throw error;
    }

    return new Response(
      JSON.stringify({ ok: true }),
      { headers: { ...corsHeaders, "content-type": "application/json" }, status: 200 }
    );
  } catch (e) {
    console.error('Track error:', e);
    return new Response(
      JSON.stringify({ ok: false, error: e.message }),
      { headers: { ...corsHeaders, "content-type": "application/json" }, status: 400 }
    );
  }
});