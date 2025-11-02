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
    const { email, first_name, last_name, phone, company, utm, referrer } = await req.json();

    console.log('Lead capture request:', { email, first_name, last_name, company });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Upsert company if provided
    let company_id: string | null = null;
    if (company) {
      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .upsert({ name: company }, { onConflict: "name" })
        .select("id")
        .single();
      
      if (companyError) {
        console.error('Company upsert error:', companyError);
      } else {
        company_id = companyData?.id ?? null;
      }
    }

    // Upsert contact
    const { data: contact, error: contactError } = await supabase
      .from("contacts")
      .upsert({
        email,
        first_name,
        last_name,
        phone,
        company_id,
        source: "website",
        lifecycle: "lead"
      }, { onConflict: "email" })
      .select("id")
      .single();

    if (contactError) {
      console.error('Contact upsert error:', contactError);
      throw contactError;
    }

    // Log event
    await supabase.from("events").insert({
      event: "lead_submitted",
      anon_id: crypto.randomUUID(),
      props: { first_name, last_name, phone, company },
      referrer,
      utm: utm || {}
    });

    console.log('Lead captured successfully:', contact?.id);

    return new Response(
      JSON.stringify({ ok: true, contact_id: contact?.id }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (e) {
    console.error('Lead capture error:', e);
    return new Response(
      JSON.stringify({ ok: false, error: e.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});