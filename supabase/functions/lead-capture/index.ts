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

    const { email, first_name, last_name, phone, company, utm, referrer } = await req.json();

    console.log('Processing lead capture:', { email, company });

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
      utm
    });

    return new Response(
      JSON.stringify({ ok: true, contact_id: contact?.id }),
      { headers: { ...corsHeaders, "content-type": "application/json" }, status: 200 }
    );
  } catch (e) {
    console.error('Lead capture error:', e);
    return new Response(
      JSON.stringify({ ok: false, error: e.message }),
      { headers: { ...corsHeaders, "content-type": "application/json" }, status: 400 }
    );
  }
});