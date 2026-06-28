// Shared helper to validate the x-internal-secret header used by
// cron-invoked lifecycle edge functions.
//
// Accepts (in priority order):
//   1) Any value listed in ASSETSAFE_SECRET_KEYS  (comma- or whitespace-separated;
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

export function getAcceptedInternalSecrets(): string[] {
  const out = new Set<string>();
  for (const envName of ["ASSETSAFE_SECRET_KEYS", "SUPABASE_SECRET_KEYS"]) {
    const list = Deno.env.get(envName);
    if (list) {
      for (const part of list.split(/[\s,]+/)) {
        const trimmed = part.trim();
        if (trimmed) out.add(trimmed);
      }
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
    has_platform_secret_keys: Boolean(Deno.env.get("SUPABASE_SECRET_KEYS")),
    has_legacy_service_role_key: Boolean(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")),
  });
  return false;
}

/**
 * Returns the preferred secret value to forward in an `x-internal-secret`
 * header when one cron function calls another. Prefers the first
 * ASSETSAFE_SECRET_KEYS entry, then the first platform SUPABASE_SECRET_KEYS
 * entry, falling back to SUPABASE_SERVICE_ROLE_KEY.
 */
export function getPreferredInternalSecret(): string | null {
  for (const envName of ["ASSETSAFE_SECRET_KEYS", "SUPABASE_SECRET_KEYS"]) {
    const list = Deno.env.get(envName);
    if (list) {
      const first = list.split(/[\s,]+/).map((p) => p.trim()).find(Boolean);
      if (first) return first;
    }
  }
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? null;
}
