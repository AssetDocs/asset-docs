export type TurnstileVerification =
  | { ok: true }
  | { ok: false; status: number; code: string; message: string };

type SiteverifyResponse = {
  success: boolean;
  "error-codes"?: string[];
};

export function getClientIp(req: Request): string | null {
  return (
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    null
  );
}

export async function verifyTurnstileToken(
  token: unknown,
  req: Request,
): Promise<TurnstileVerification> {
  if (typeof token !== "string" || token.trim().length === 0) {
    console.warn("[TURNSTILE] bot_check_failed", { reason: "missing_token" });
    return {
      ok: false,
      status: 400,
      code: "bot_check_required",
      message: "Please complete this quick security check.",
    };
  }

  const secret = Deno.env.get("TURNSTILE_SECRET_KEY");
  if (!secret) {
    console.error("[TURNSTILE] bot_check_unavailable", { reason: "missing_secret" });
    return {
      ok: false,
      status: 503,
      code: "bot_check_unavailable",
      message: "The security check is temporarily unavailable. Please try again.",
    };
  }

  const formData = new FormData();
  formData.set("secret", secret);
  formData.set("response", token);

  const remoteIp = getClientIp(req);
  if (remoteIp) formData.set("remoteip", remoteIp);

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      console.error("[TURNSTILE] bot_check_unavailable", { status: response.status });
      return {
        ok: false,
        status: 503,
        code: "bot_check_unavailable",
        message: "The security check is temporarily unavailable. Please try again.",
      };
    }

    const result = await response.json() as SiteverifyResponse;
    if (result.success) {
      console.info("[TURNSTILE] bot_check_passed");
      return { ok: true };
    }

    const errors = result["error-codes"] ?? [];
    console.warn("[TURNSTILE] bot_check_failed", { errors });
    return {
      ok: false,
      status: 403,
      code: errors.includes("timeout-or-duplicate") ? "bot_check_expired" : "bot_check_failed",
      message: errors.includes("timeout-or-duplicate")
        ? "The security check expired. Please try again."
        : "We could not verify this request. Please try again.",
    };
  } catch (error) {
    console.error("[TURNSTILE] bot_check_unavailable", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return {
      ok: false,
      status: 503,
      code: "bot_check_unavailable",
      message: "The security check is temporarily unavailable. Please try again.",
    };
  }
}

export function turnstileErrorResponse(
  result: Exclude<TurnstileVerification, { ok: true }>,
  corsHeaders: Record<string, string>,
): Response {
  return new Response(
    JSON.stringify({ error: result.message, code: result.code }),
    {
      status: result.status,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    },
  );
}
