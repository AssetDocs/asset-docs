import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { getSupabaseServiceRoleKey, isAuthorizedInternalCall } from "../_shared/internalSecret.ts";
import {
  buildGiftExpirationNoticeHtml,
  buildGiftExpirationNoticeText,
  giftExpirationNoticeSubject,
  type GiftExpirationNoticeType,
} from "../send-gift-email/templates.ts";

const JOB_NAME = "expire-gift-entitlements";
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-internal-secret",
};

type SupabaseAdminClient = ReturnType<typeof createClient>;

type ClaimedNotice = {
  gift_id: string;
  notice_type: GiftExpirationNoticeType;
  recipient_email: string;
  recipient_first_name: string | null;
  purchaser_email: string | null;
  expiration_date: string;
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function formatExpirationDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/Chicago",
  });
}

async function recordCronJobResult(
  admin: SupabaseAdminClient,
  startedAt: number,
  status: "succeeded" | "failed",
  result: Record<string, unknown> = {},
  errorMessage: string | null = null,
) {
  const { error } = await admin.rpc("record_cron_job_result", {
    p_job_name: JOB_NAME,
    p_status: status,
    p_duration_ms: Date.now() - startedAt,
    p_result: result,
    p_error: errorMessage,
  });

  if (error) {
    console.error("[EXPIRE-GIFT-ENTITLEMENTS] Cron health update failed", error);
  }
}

async function sendNotice(notice: ClaimedNotice) {
  const expirationDate = formatExpirationDate(notice.expiration_date);
  const payload = {
    noticeType: notice.notice_type,
    firstName: notice.recipient_first_name || "there",
    expirationDate,
  };

  const response = await resend.emails.send({
    from: "Asset Safe <noreply@assetsafe.net>",
    to: [notice.recipient_email],
    subject: giftExpirationNoticeSubject(notice.notice_type),
    html: buildGiftExpirationNoticeHtml(payload),
    text: buildGiftExpirationNoticeText(payload),
  });

  if (response.error) {
    throw new Error(response.error.message);
  }

  return response.data?.id ?? null;
}

async function releaseNoticeClaim(admin: SupabaseAdminClient, notice: ClaimedNotice) {
  const fieldByNoticeType: Record<GiftExpirationNoticeType, string> = {
    thirty_day: "expiration_30_day_email_sent_at",
    fifteen_day: "expiration_15_day_email_sent_at",
    three_day: "expiration_3_day_email_sent_at",
    expiration_day: "expiration_day_email_sent_at",
  };

  const field = fieldByNoticeType[notice.notice_type];
  const { error } = await admin
    .from("gift_subscriptions")
    .update({ [field]: null, updated_at: new Date().toISOString() })
    .eq("id", notice.gift_id);

  if (error) {
    console.error("[EXPIRE-GIFT-ENTITLEMENTS] Failed to release notice claim", {
      gift_id: notice.gift_id,
      notice_type: notice.notice_type,
      error: error.message,
    });
  }
}

serve(async (req) => {
  const startedAt = Date.now();

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!isAuthorizedInternalCall(req)) {
    return json(401, { error: "unauthorized" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = getSupabaseServiceRoleKey();
  if (!supabaseUrl || !serviceKey) {
    return json(500, { error: "missing_environment" });
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  await admin.rpc("record_cron_job_started", { p_job_name: JOB_NAME });

  try {
    const body = await req.json().catch(() => ({}));
    const limit = Math.min(500, Math.max(1, Number(body.limit ?? 100)));
    const dryRun = body.dry_run === true;

    if (dryRun) {
      const result = { dry_run: true, expired: 0, notices_claimed: 0, notices_sent: 0 };
      await recordCronJobResult(admin, startedAt, "succeeded", result);
      return json(200, { success: true, ...result });
    }

    const { data: expiredRows, error: expireError } = await admin.rpc("expire_gift_entitlements", {
      p_limit: limit,
    });

    if (expireError) {
      throw new Error(`expire_gift_entitlements failed: ${expireError.message}`);
    }

    const { data: claimedRows, error: claimError } = await admin.rpc("claim_due_gift_expiration_notices", {
      p_limit: limit,
    });

    if (claimError) {
      throw new Error(`claim_due_gift_expiration_notices failed: ${claimError.message}`);
    }

    const notices = (claimedRows ?? []) as ClaimedNotice[];
    const sendResults: Array<Record<string, unknown>> = [];

    for (const notice of notices) {
      try {
        const messageId = await sendNotice(notice);
        sendResults.push({
          gift_id: notice.gift_id,
          notice_type: notice.notice_type,
          recipient_email: notice.recipient_email,
          success: true,
          resend_message_id: messageId,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        await releaseNoticeClaim(admin, notice);
        console.error("[EXPIRE-GIFT-ENTITLEMENTS] Notice send failed", {
          gift_id: notice.gift_id,
          notice_type: notice.notice_type,
          error: message,
        });
        sendResults.push({
          gift_id: notice.gift_id,
          notice_type: notice.notice_type,
          recipient_email: notice.recipient_email,
          success: false,
          error: message,
        });
      }
    }

    const result = {
      expired: (expiredRows ?? []).length,
      notices_claimed: notices.length,
      notices_sent: sendResults.filter((row) => row.success === true).length,
      notice_failures: sendResults.filter((row) => row.success !== true).length,
      send_results: sendResults,
    };

    const failed = result.notice_failures > 0;
    await recordCronJobResult(
      admin,
      startedAt,
      failed ? "failed" : "succeeded",
      result,
      failed ? "One or more gift expiration notices failed to send" : null,
    );

    return json(failed ? 207 : 200, { success: !failed, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[EXPIRE-GIFT-ENTITLEMENTS] ERROR", { message });
    await recordCronJobResult(admin, startedAt, "failed", {}, message);
    return json(500, { success: false, error: message });
  }
});
