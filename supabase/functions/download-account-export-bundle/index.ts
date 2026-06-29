import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";

function firstSecretFromList(envName: string): string | null {
  const value = Deno.env.get(envName);
  if (!value) return null;
  return value
    .split(/[\s,]+/)
    .map((part) => part.trim())
    .filter(Boolean)[0] ?? null;
}

function getSupabaseAdminKey(): string | null {
  return (
    firstSecretFromList("SUPABASE_SECRET_KEYS") ||
    firstSecretFromList("ASSETSAFE_SECRET_KEYS") ||
    firstSecretFromList("assetsafe_secret_keys") ||
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
    null
  );
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ConsumedBundle = {
  audit_id: string;
  account_id: string;
  storage_bucket: string;
  storage_path: string;
  bundle_file_name: string | null;
  signed_url_ttl_seconds: number;
  expires_at: string;
  download_count: number;
  download_limit: number;
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json(405, { error: "method_not_allowed" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = getSupabaseAdminKey();

  if (!supabaseUrl || !anonKey || !serviceKey) {
    return json(500, { error: "missing_environment" });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return json(401, { error: "missing_authorization" });
  }

  const body = await req.json().catch(() => ({}));
  const auditId = typeof body.audit_id === "string" ? body.audit_id : null;
  if (!auditId) {
    return json(400, { error: "missing_audit_id" });
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const admin = createClient(supabaseUrl, serviceKey);

  const { data, error } = await userClient
    .rpc("consume_account_export_bundle", { p_audit_id: auditId })
    .single();

  if (error) {
    console.error("[DOWNLOAD-ACCOUNT-EXPORT-BUNDLE] consume failed", error);
    return json(400, { error: error.message });
  }

  const bundle = data as ConsumedBundle;
  const ttlSeconds = Math.min(3600, Math.max(60, Number(bundle.signed_url_ttl_seconds || 900)));

  const { data: signed, error: signedError } = await admin.storage
    .from(bundle.storage_bucket)
    .createSignedUrl(bundle.storage_path, ttlSeconds, {
      download: bundle.bundle_file_name || undefined,
    });

  if (signedError || !signed?.signedUrl) {
    console.error("[DOWNLOAD-ACCOUNT-EXPORT-BUNDLE] signed URL failed", signedError);
    return json(500, { error: "signed_url_failed", details: signedError?.message });
  }

  return json(200, {
    audit_id: bundle.audit_id,
    account_id: bundle.account_id,
    signed_url: signed.signedUrl,
    signed_url_ttl_seconds: ttlSeconds,
    expires_at: bundle.expires_at,
    download_count: bundle.download_count,
    download_limit: bundle.download_limit,
  });
});
