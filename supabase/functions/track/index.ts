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

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { event, props, path, referrer, utm, occurred_at } = await req.json();

    console.log('Track event:', { event, path });

    // Try to resolve user from Supabase auth token
    let user_id: string | null = null;
    const auth = req.headers.get("authorization");
    if (auth?.startsWith("Bearer ")) {
      const token = auth.split(" ")[1];
      const { data } = await supabase.auth.getUser(token);
      user_id = data.user?.id ?? null;
    }

    const { error } = await supabase.from("events").insert({
      user_id,
      event,
      props: props || {},
      path,
      referrer,
      utm: utm || {},
      occurred_at: occurred_at || new Date().toISOString()
    });

    if (error) {
      console.error('Event insert error:', error);
      throw error;
    }

    console.log('Event tracked successfully');

    return new Response(
      JSON.stringify({ ok: true }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (e) {
    console.error('Track error:', e);
    return new Response(
      JSON.stringify({ ok: false, error: e.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});