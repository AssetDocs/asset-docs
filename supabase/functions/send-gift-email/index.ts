// send-gift-email - single writer for gift email delivery.
// Auth: x-internal-secret (SUPABASE_SERVICE_ROLE_KEY) or admin JWT.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { isAuthorizedInternalCall } from "../_shared/internalSecret.ts";
import {
  ACCOUNT_URL,
  PRICING_URL,
  buildPurchaserCodeHtml,
  buildPurchaserCodeText,
  buildPurchaserConfirmationHtml,
  buildPurchaserConfirmationText,
  buildRecipientRedemptionHtml,
  buildRecipientRedemptionText,
  purchaserCodeSubject,
  purchaserConfirmationSubject,
  recipientRedemptionSubject,
} from "./templates.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-internal-secret",
};

const log = (s: string, d?: unknown) =>
  console.log(`[SEND-GIFT-EMAIL] ${s}${d ? " - " + JSON.stringify(d) : ""}`);

async function resolvePurchaserSecondaryCta(
  supabase: ReturnType<typeof createClient>,
  gift: { purchaser_user_id?: string | null },
): Promise<string> {
  try {
    if (!gift.purchaser_user_id) return PRICING_URL;
    const { data } = await supabase
      .from("entitlements")
      .select("status")
      .eq("user_id", gift.purchaser_user_id)
      .maybeSingle();
    const status = (data as { status?: string } | null)?.status;
    const active = status && ["active", "trialing", "grace"].includes(status);
    return active ? ACCOUNT_URL : PRICING_URL;
  } catch {
    return PRICING_URL;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    let authorized = false;
    if (isAuthorizedInternalCall(req)) {
      authorized = true;
    } else {
      const authHeader = req.headers.get("Authorization");
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.replace("Bearer ", "");
        const { data, error } = await supabase.auth.getUser(token);
        if (!error && data?.user) {
          const { data: hasAdmin } = await supabase.rpc("has_app_role", {
            _user_id: data.user.id,
            _role: "admin",
          });
          if (hasAdmin === true) authorized = true;
        }
      }
    }
    if (!authorized) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { giftId, giftCode, claimToken, resend: isResend } = body ?? {};
    if (!giftId && !giftCode) {
      throw new Error("giftId or giftCode is required");
    }

    let query = supabase.from("gift_subscriptions").select("*").limit(1);
    query = giftId ? query.eq("id", giftId) : query.eq("gift_code", giftCode);
    const { data: rows, error: fetchError } = await query;
    if (fetchError || !rows || rows.length === 0) throw new Error("Gift subscription not found");
    const gift = rows[0];

    const deliveryMethod = gift.delivery_method || "recipient_email";
    const isPurchaserCode = deliveryMethod === "purchaser_code";

    if (gift.payment_status !== "paid") throw new Error("Gift not paid yet");
    if (!isPurchaserCode && !claimToken) throw new Error("claimToken is required for recipient-email gifts");

    if (
      !isResend &&
      ((isPurchaserCode && gift.purchaser_email_sent_at) ||
        (!isPurchaserCode && gift.recipient_email_sent_at))
    ) {
      log("Idempotent skip - already sent", { id: gift.id });
      return new Response(JSON.stringify({ skipped: "already_sent" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const claimUrl = isPurchaserCode
      ? `https://getassetsafe.com/gift-claim?code=${encodeURIComponent(gift.gift_code)}`
      : `https://getassetsafe.com/gift-claim?code=${encodeURIComponent(gift.gift_code)}&token=${encodeURIComponent(claimToken)}`;

    let recipientEmailId: string | null = null;
    let purchaserEmailId: string | null = null;
    let lastError: string | null = null;

    if (isPurchaserCode) {
      try {
        const purRes = await resend.emails.send({
          from: "Asset Safe <noreply@assetsafe.net>",
          to: [gift.purchaser_email],
          subject: purchaserCodeSubject(),
          html: buildPurchaserCodeHtml({
            giftCode: gift.gift_code,
            claimUrl,
            giftMessage: gift.gift_message,
            purchaserEmail: gift.purchaser_email,
          }),
          text: buildPurchaserCodeText({
            giftCode: gift.gift_code,
            claimUrl,
            giftMessage: gift.gift_message,
            purchaserEmail: gift.purchaser_email,
          }),
        });
        purchaserEmailId = purRes.data?.id ?? null;
        if (purRes.error) lastError = `purchaser: ${purRes.error.message}`;
        log("Purchaser Gift Code email send result", { id: purchaserEmailId, error: purRes.error });
      } catch (e) {
        lastError = `purchaser_throw: ${(e as Error).message}`;
        log("Purchaser Gift Code email throw", { error: lastError });
      }
    } else {
      try {
        const recData = {
          gifterName: gift.purchaser_name,
          recipientEmail: gift.recipient_email,
          giftMessage: gift.gift_message,
          claimUrl,
        };
        const recRes = await resend.emails.send({
          from: "Asset Safe <noreply@assetsafe.net>",
          to: [gift.recipient_email],
          subject: recipientRedemptionSubject(gift.purchaser_name),
          html: buildRecipientRedemptionHtml(recData),
          text: buildRecipientRedemptionText(recData),
        });
        recipientEmailId = recRes.data?.id ?? null;
        if (recRes.error) lastError = `recipient: ${recRes.error.message}`;
        log("Recipient email send result", { id: recipientEmailId, error: recRes.error });
      } catch (e) {
        lastError = `recipient_throw: ${(e as Error).message}`;
        log("Recipient email throw", { error: lastError });
      }

      if (!isResend && gift.purchaser_email && !gift.purchaser_email_sent_at) {
        try {
          const secondaryCtaUrl = await resolvePurchaserSecondaryCta(supabase, gift);
          const purData = {
            recipientEmail: gift.recipient_email,
            recipientName: gift.recipient_name,
            secondaryCtaUrl,
          };
          const purRes = await resend.emails.send({
            from: "Asset Safe <noreply@assetsafe.net>",
            to: [gift.purchaser_email],
            subject: purchaserConfirmationSubject(),
            html: buildPurchaserConfirmationHtml(purData),
            text: buildPurchaserConfirmationText(purData),
          });
          purchaserEmailId = purRes.data?.id ?? null;
          if (purRes.error && !lastError) lastError = `purchaser: ${purRes.error.message}`;
        } catch (e) {
          if (!lastError) lastError = `purchaser_throw: ${(e as Error).message}`;
        }
      }
    }

    const now = new Date().toISOString();
    const sent = isPurchaserCode ? purchaserEmailId !== null : recipientEmailId !== null;
    const updates: Record<string, unknown> = {
      delivery_status: sent ? "sent" : "failed",
      delivery_attempted_at: now,
      last_delivery_error: sent ? null : lastError,
      updated_at: now,
    };
    if (sent) {
      updates.delivered_at = now;
      updates.status = isPurchaserCode ? "active_unclaimed" : "delivered";
      if (isPurchaserCode) {
        updates.purchaser_email_sent_at = now;
        updates.resend_purchaser_email_id = purchaserEmailId;
      } else {
        updates.recipient_email_sent_at = now;
        updates.resend_recipient_email_id = recipientEmailId;
      }
    }
    if (!isPurchaserCode && purchaserEmailId) {
      updates.purchaser_email_sent_at = now;
      updates.resend_purchaser_email_id = purchaserEmailId;
    }

    const { error: updErr } = await supabase
      .from("gift_subscriptions")
      .update(updates)
      .eq("id", gift.id);
    if (updErr) {
      log("Failed to update gift row", updErr);
      return new Response(JSON.stringify({ error: "Gift email was accepted but delivery state could not be saved" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ success: sent, recipientEmailId, purchaserEmailId, error: sent ? null : lastError }),
      { status: sent ? 200 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    log("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
