// Compatibility wrapper for the legacy gift-reminder cron endpoint.
// The canonical worker is expire-gift-entitlements.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getPreferredInternalSecret, isAuthorizedInternalCall } from "../_shared/internalSecret.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-internal-secret",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!isAuthorizedInternalCall(req)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const internalSecret = getPreferredInternalSecret();
  if (!supabaseUrl || !serviceKey || !internalSecret) {
    return new Response(JSON.stringify({ error: "missing_environment" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const body = await req.json().catch(() => ({}));
  const response = await fetch(`${supabaseUrl}/functions/v1/expire-gift-entitlements`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${serviceKey}`,
      "x-internal-secret": internalSecret,
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  return new Response(text, {
    status: response.status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
});
