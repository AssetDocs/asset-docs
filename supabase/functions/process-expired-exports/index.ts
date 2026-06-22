import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-internal-secret",
};

type SupabaseAdminClient = ReturnType<typeof createClient>;

type StorageFile = {
  name: string;
  id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  last_accessed_at?: string | null;
  metadata?: Record<string, unknown> | null;
};

type SweepResult = {
  bucket: string;
  scanned: number;
  eligible: number;
  removed: number;
  failed: number;
  errors: string[];
};

type ExpiredBundle = {
  audit_id: string;
  storage_bucket: string;
  storage_path: string;
};

type BundleSweepResult = {
  candidates: number;
  removed: number;
  failed: number;
  errors: string[];
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function parseBucketList(value: unknown, fallback: string[]) {
  if (Array.isArray(value)) {
    return value.map(String).map((v) => v.trim()).filter(Boolean);
  }

  if (typeof value === "string" && value.trim()) {
    return value.split(",").map((v) => v.trim()).filter(Boolean);
  }

  return fallback;
}

function isExpired(file: StorageFile, cutoffMs: number) {
  const timestamp = file.updated_at ?? file.created_at ?? file.last_accessed_at;
  if (!timestamp) return false;
  return new Date(timestamp).getTime() <= cutoffMs;
}

function isDirectoryLike(file: StorageFile) {
  return !file.id && !file.metadata;
}

function joinPath(prefix: string, name: string) {
  return prefix ? `${prefix}/${name}` : name;
}

async function listExpiredObjects(
  admin: SupabaseAdminClient,
  bucket: string,
  prefix: string,
  cutoffMs: number,
  maxObjects: number,
  result: SweepResult,
  paths: string[],
) {
  const pageSize = 1000;
  let offset = 0;

  while (paths.length < maxObjects) {
    const { data, error } = await admin.storage
      .from(bucket)
      .list(prefix, {
        limit: Math.min(pageSize, maxObjects - paths.length),
        offset,
        sortBy: { column: "name", order: "asc" },
      });

    if (error) {
      result.errors.push(`${prefix || "/"}: ${error.message}`);
      return;
    }

    const files = (data ?? []) as StorageFile[];
    if (files.length === 0) return;

    for (const file of files) {
      const objectPath = joinPath(prefix, file.name);

      if (isDirectoryLike(file)) {
        await listExpiredObjects(admin, bucket, objectPath, cutoffMs, maxObjects, result, paths);
        continue;
      }

      result.scanned++;
      if (isExpired(file, cutoffMs)) {
        result.eligible++;
        paths.push(objectPath);
      }

      if (paths.length >= maxObjects) break;
    }

    if (files.length < pageSize) return;
    offset += files.length;
  }
}

async function removeInBatches(
  admin: SupabaseAdminClient,
  bucket: string,
  paths: string[],
  dryRun: boolean,
  result: SweepResult,
) {
  if (dryRun || paths.length === 0) return;

  for (let i = 0; i < paths.length; i += 100) {
    const batch = paths.slice(i, i + 100);
    const { error } = await admin.storage.from(bucket).remove(batch);
    if (error) {
      result.failed += batch.length;
      result.errors.push(error.message);
    } else {
      result.removed += batch.length;
    }
  }
}

async function removeExpiredBundleObjects(
  admin: SupabaseAdminClient,
  bundles: ExpiredBundle[],
  dryRun: boolean,
): Promise<BundleSweepResult> {
  const result: BundleSweepResult = {
    candidates: bundles.length,
    removed: 0,
    failed: 0,
    errors: [],
  };

  if (dryRun || bundles.length === 0) return result;

  const byBucket = new Map<string, string[]>();
  for (const bundle of bundles) {
    if (!bundle.storage_bucket || !bundle.storage_path) continue;
    const paths = byBucket.get(bundle.storage_bucket) ?? [];
    paths.push(bundle.storage_path);
    byBucket.set(bundle.storage_bucket, paths);
  }

  for (const [bucket, paths] of byBucket.entries()) {
    for (let i = 0; i < paths.length; i += 100) {
      const batch = paths.slice(i, i + 100);
      const { error } = await admin.storage.from(bucket).remove(batch);
      if (error) {
        result.failed += batch.length;
        result.errors.push(`${bucket}: ${error.message}`);
      } else {
        result.removed += batch.length;
      }
    }
  }

  return result;
}

async function recordCronJobResult(
  admin: SupabaseAdminClient,
  startedAt: number,
  status: "succeeded" | "failed",
  result: Record<string, unknown> = {},
  errorMessage: string | null = null,
) {
  const { error } = await admin.rpc("record_cron_job_result", {
    p_job_name: "process-expired-exports",
    p_status: status,
    p_duration_ms: Date.now() - startedAt,
    p_result: result,
    p_error: errorMessage,
  });

  if (error) {
    console.error("[PROCESS-EXPIRED-EXPORTS] Cron health update failed", error);
  }
}

serve(async (req) => {
  const startedAt = Date.now();

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const internalSecret = req.headers.get("x-internal-secret");
  const expectedSecret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!internalSecret || internalSecret !== expectedSecret) {
    return json(401, { error: "unauthorized" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return json(500, { error: "missing_environment" });
  }

  const body = await req.json().catch(() => ({}));
  const dryRun = body.dry_run === true;
  const minAgeHours = Math.min(24 * 30, Math.max(1, Number(
    body.min_age_hours ?? Deno.env.get("EXPORT_SWEEP_MIN_AGE_HOURS") ?? 24,
  )));
  const maxObjectsPerBucket = Math.min(5000, Math.max(1, Number(body.limit ?? 1000)));
  const buckets = parseBucketList(
    body.buckets,
    parseBucketList(Deno.env.get("EXPORT_SWEEP_BUCKETS"), ["exports"]),
  );
  const cutoffMs = Date.now() - minAgeHours * 60 * 60 * 1000;

  const admin = createClient(supabaseUrl, serviceKey);
  await admin.rpc("record_cron_job_started", {
    p_job_name: "process-expired-exports",
  });

  const { data: expiredAuthorizations, error: authError } = await admin
    .rpc("expire_continuity_export_authorizations");

  if (authError) {
    console.error("[PROCESS-EXPIRED-EXPORTS] Authorization expiry failed", authError);
    await recordCronJobResult(
      admin,
      startedAt,
      "failed",
      { dry_run: dryRun, min_age_hours: minAgeHours, buckets },
      authError.message,
    );
    return json(500, { error: "authorization_expiry_failed", details: authError.message });
  }

  const { data: expiredBundles, error: bundleError } = await admin
    .rpc("expire_account_export_bundles", {
      p_limit: maxObjectsPerBucket,
      p_dry_run: dryRun,
    });

  if (bundleError) {
    console.error("[PROCESS-EXPIRED-EXPORTS] Account export bundle expiry failed", bundleError);
    await recordCronJobResult(
      admin,
      startedAt,
      "failed",
      { dry_run: dryRun, min_age_hours: minAgeHours, buckets },
      bundleError.message,
    );
    return json(500, { error: "account_export_bundle_expiry_failed", details: bundleError.message });
  }

  const bundleResult = await removeExpiredBundleObjects(
    admin,
    (expiredBundles ?? []) as ExpiredBundle[],
    dryRun,
  );

  const results: SweepResult[] = [];

  for (const bucket of buckets) {
    const result: SweepResult = {
      bucket,
      scanned: 0,
      eligible: 0,
      removed: 0,
      failed: 0,
      errors: [],
    };
    const paths: string[] = [];

    await listExpiredObjects(admin, bucket, "", cutoffMs, maxObjectsPerBucket, result, paths);
    await removeInBatches(admin, bucket, paths, dryRun, result);
    results.push(result);
  }

  const failed = results.some((result) => result.failed > 0) || bundleResult.failed > 0;
  const response = {
    ok: !failed,
    dry_run: dryRun,
    min_age_hours: minAgeHours,
    expired_authorizations: expiredAuthorizations ?? 0,
    expired_account_export_bundles: bundleResult,
    buckets: results,
  };

  await recordCronJobResult(
    admin,
    startedAt,
    failed ? "failed" : "succeeded",
    response,
    failed ? "one_or_more_export_objects_failed_to_remove" : null,
  );

  return json(failed ? 207 : 200, response);
});
