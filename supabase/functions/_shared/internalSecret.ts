// Shared helper to validate the x-internal-secret header used by
// cron-invoked lifecycle edge functions.
//
// Accepts (in priority order):
//   1) Any value listed in ASSETSAFE_SECRET_KEYS / assetsafe_secret_keys
//      (comma- or whitespace-separated;
//      typically one or more `sb_secret_...` keys for rotation)
//   2) Any value listed in SUPABASE_SECRET_KEYS   (platform-provided new API keys)
//   3) SUPABASE_SERVICE_ROLE_KEY                  (legacy fallback)
//
// Using constant-time comparison to avoid timing leaks.

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

function fingerprintSecret(value: string): string {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function splitSecretList(envName: string): string[] {
  const list = Deno.env.get(envName);
  if (!list) return [];
  return list
    .split(/[\s,]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function getAcceptedInternalSecrets(): string[] {
  const out = new Set<string>();
  for (const envName of ["ASSETSAFE_SECRET_KEYS", "assetsafe_secret_keys", "SUPABASE_SECRET_KEYS"]) {
    for (const secret of splitSecretList(envName)) {
      out.add(secret);
    }
  }
  const legacy = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (legacy) out.add(legacy);
  return [...out];
}

export function isAuthorizedInternalCall(req: Request): boolean {
  const provided = req.headers.get("x-internal-secret");
  if (!provided) return false;
  const acceptedSecrets = getAcceptedInternalSecrets();
  for (const accepted of acceptedSecrets) {
    if (timingSafeEqual(provided, accepted)) return true;
  }
  console.warn("[INTERNAL-SECRET] Unauthorized internal call", {
    provided_length: provided.length,
    accepted_count: acceptedSecrets.length,
    accepted_lengths: acceptedSecrets.map((secret) => secret.length),
    has_assetsafe_secret_keys: Boolean(Deno.env.get("ASSETSAFE_SECRET_KEYS")),
    has_lowercase_assetsafe_secret_keys: Boolean(Deno.env.get("assetsafe_secret_keys")),
    has_platform_secret_keys: Boolean(Deno.env.get("SUPABASE_SECRET_KEYS")),
    has_legacy_service_role_key: Boolean(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")),
  });
  return false;
}

export function getInternalSecretAuthMetadata(req: Request): Record<string, unknown> {
  const provided = req.headers.get("x-internal-secret");
  const acceptedSecrets = getAcceptedInternalSecrets();
  const acceptedSources = ["ASSETSAFE_SECRET_KEYS", "assetsafe_secret_keys", "SUPABASE_SECRET_KEYS", "SUPABASE_SERVICE_ROLE_KEY"]
    .flatMap((source) => {
      const secrets = source === "SUPABASE_SERVICE_ROLE_KEY"
        ? [Deno.env.get(source)].filter((secret): secret is string => Boolean(secret))
        : splitSecretList(source);
      return secrets.map((secret) => ({
        source,
        length: secret.length,
        fingerprint: fingerprintSecret(secret),
      }));
    });
  return {
    provided_header_present: Boolean(provided),
    provided_length: provided?.length ?? 0,
    provided_fingerprint: provided ? fingerprintSecret(provided) : null,
    accepted_count: acceptedSecrets.length,
    accepted_lengths: acceptedSecrets.map((secret) => secret.length),
    accepted_sources: acceptedSources,
    has_assetsafe_secret_keys: Boolean(Deno.env.get("ASSETSAFE_SECRET_KEYS")),
    has_lowercase_assetsafe_secret_keys: Boolean(Deno.env.get("assetsafe_secret_keys")),
    has_platform_secret_keys: Boolean(Deno.env.get("SUPABASE_SECRET_KEYS")),
    has_legacy_service_role_key: Boolean(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")),
  };
}

/**
 * Returns the preferred secret value to forward in an `x-internal-secret`
 * header when one cron function calls another. Prefers the first
 * ASSETSAFE_SECRET_KEYS / assetsafe_secret_keys entry, then the first platform
 * SUPABASE_SECRET_KEYS entry, falling back to SUPABASE_SERVICE_ROLE_KEY.
 */
export function getPreferredInternalSecret(): string | null {
  for (const envName of ["ASSETSAFE_SECRET_KEYS", "assetsafe_secret_keys", "SUPABASE_SECRET_KEYS"]) {
    const first = splitSecretList(envName)[0];
    if (first) return first;
  }
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? null;
}
