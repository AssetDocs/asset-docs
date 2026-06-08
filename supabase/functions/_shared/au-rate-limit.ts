/**
 * Shared rate-limit helper for Authorized User invite endpoints.
 * Delegates to the existing rate-limit-check edge function.
 *
 * Returns { allowed: true } or { allowed: false, retryAfter, message } where
 * `message` is a user-safe string suitable for surfacing in UI.
 */
export async function checkAuRateLimit(
  identifier: string,
  action: string,
  opts: { maxAttempts?: number; windowMinutes?: number } = {},
): Promise<{ allowed: true } | { allowed: false; retryAfter: number; message: string }> {
  const url = `${Deno.env.get("SUPABASE_URL")}/functions/v1/rate-limit-check`;
  const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${anon}`,
        apikey: anon,
      },
      body: JSON.stringify({
        identifier,
        action,
        maxAttempts: opts.maxAttempts ?? 10,
        windowMinutes: opts.windowMinutes ?? 60,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 429 || data?.allowed === false) {
      const retryAfter = Number(data?.retryAfter) || 60;
      const mins = Math.max(1, Math.ceil(retryAfter / 60));
      return {
        allowed: false,
        retryAfter,
        message: `Too many requests. Please try again in about ${mins} minute${mins === 1 ? "" : "s"}.`,
      };
    }
    return { allowed: true };
  } catch (e) {
    // Fail-open: never block legitimate users on rate-limit infra failure.
    console.error("[AU-RATE-LIMIT] check failed (fail-open):", e);
    return { allowed: true };
  }
}
