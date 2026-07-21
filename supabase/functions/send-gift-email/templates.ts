// Pure template builders for send-gift-email. Exported for testing.

export const PLAN_NAME = "The Asset Safe Plan";
export const GIFT_URL = "https://getassetsafe.com/gift";
export const PRICING_URL = "https://getassetsafe.com/pricing";
export const ACCOUNT_URL = "https://getassetsafe.com/account";
export const SUPPORT_EMAIL = "support@assetsafe.net";
export const LOGO_URL =
  "https://getassetsafe.com/lovable-uploads/asset-safe-logo-email-v2.jpg";

export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function logoHeader(): string {
  return `
    <div style="text-align: center; padding: 30px 20px 20px;">
      <img src="${LOGO_URL}" alt="Asset Safe" style="max-width: 200px;" />
    </div>
  `;
}

function preheader(text: string): string {
  return `<div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#f8fafc;opacity:0;">${escapeHtml(text)}</div>`;
}

function emailShell(content: string, preheaderText?: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8fafc;">
      ${preheaderText ? preheader(preheaderText) : ""}
      ${logoHeader()}
      <div style="background: #ffffff; padding: 30px 25px; margin: 0 20px; border-radius: 8px;">
        ${content}
      </div>
      <div style="padding: 20px; text-align: center;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          Questions? Contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color: #1e40af;">${SUPPORT_EMAIL}</a>.
        </p>
      </div>
    </div>
  `;
}

export interface PurchaserConfirmationData {
  recipientEmail: string;
  recipientName?: string | null;
  secondaryCtaUrl: string; // account or pricing
  giftUrl?: string;
}

export function purchaserConfirmationSubject(): string {
  return "Your Asset Safe Gift Has Been Sent";
}

export function purchaserConfirmationPreheader(): string {
  return "Your gift has been delivered, and the recipient will receive secure redemption instructions.";
}

export function buildPurchaserConfirmationHtml(d: PurchaserConfirmationData): string {
  const giftUrl = d.giftUrl ?? GIFT_URL;
  const deliveredTo = d.recipientName && d.recipientName.trim().length > 0
    ? `<strong>${escapeHtml(d.recipientName)}</strong> at <strong>${escapeHtml(d.recipientEmail)}</strong>`
    : `<strong>${escapeHtml(d.recipientEmail)}</strong>`;

  return emailShell(`
    <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 22px;">Gift Sent Successfully!</h2>
    <p style="color: #374151; line-height: 1.6; margin: 0 0 16px;">
      Your gift of <strong>${PLAN_NAME}</strong> has been delivered to ${deliveredTo}.
    </p>
    <p style="color: #374151; line-height: 1.6; margin: 0 0 16px;">
      You've given them a secure place to organize important property records, family information, documents, photos, and the details they may need when it matters most.
    </p>
    <p style="color: #374151; line-height: 1.6; margin: 0 0 24px;">
      They'll receive a separate email with a secure link to redeem their gift.
    </p>
    <div style="text-align: center; margin: 0 0 14px;">
      <a href="${giftUrl}" style="background-color: #1e40af; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
        Send Another Gift
      </a>
    </div>
    <div style="text-align: center; margin: 0 0 24px;">
      <a href="${d.secondaryCtaUrl}" style="color: #1e40af; text-decoration: none; padding: 10px 20px; border: 1px solid #1e40af; border-radius: 6px; display: inline-block; font-weight: 500; font-size: 14px;">
        Secure Your Own Account
      </a>
    </div>
    <p style="color: #374151; line-height: 1.6; margin: 0;">
      Thank you for giving something practical, meaningful, and built to last.
    </p>
  `, purchaserConfirmationPreheader());
}

export function buildPurchaserConfirmationText(d: PurchaserConfirmationData): string {
  const giftUrl = d.giftUrl ?? GIFT_URL;
  const deliveredTo = d.recipientName && d.recipientName.trim().length > 0
    ? `${d.recipientName} at ${d.recipientEmail}`
    : d.recipientEmail;

  return `Gift Sent Successfully!

Your gift of ${PLAN_NAME} has been delivered to ${deliveredTo}.

You've given them a secure place to organize important property records, family information, documents, photos, and the details they may need when it matters most.

They'll receive a separate email with a secure link to redeem their gift.

Send another gift: ${giftUrl}
Secure your own account: ${d.secondaryCtaUrl}

Thank you for giving something practical, meaningful, and built to last.

Questions? Contact ${SUPPORT_EMAIL}.`;
}

export interface RecipientRedemptionData {
  gifterName?: string | null;
  recipientEmail: string;
  giftMessage?: string | null;
  claimUrl: string;
}

export function recipientRedemptionSubject(gifterName?: string | null): string {
  const name = (gifterName ?? "").trim();
  return name.length > 0
    ? `${name} Sent You the Gift of Asset Safe`
    : "You've Received the Gift of Asset Safe";
}

export function recipientRedemptionPreheader(): string {
  return "Redeem your gift and begin organizing what matters most.";
}

export function buildRecipientRedemptionHtml(d: RecipientRedemptionData): string {
  const gifter = (d.gifterName ?? "").trim();
  const openingLine = gifter.length > 0
    ? `<strong>${escapeHtml(gifter)}</strong> has gifted you a subscription to <strong>${PLAN_NAME}</strong>.`
    : `Someone has gifted you a subscription to <strong>${PLAN_NAME}</strong>.`;

  const message = (d.giftMessage ?? "").trim();
  const messageBlock = message.length > 0
    ? `
      <div style="background: #f8fafc; border-left: 4px solid #1e40af; padding: 12px 16px; border-radius: 4px; margin: 0 0 20px;">
        <p style="color: #374151; margin: 0; font-style: italic; white-space: pre-wrap;">"${escapeHtml(message)}"</p>
      </div>`
    : "";

  return emailShell(`
    <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 22px;">You've Received a Gift!</h2>
    <p style="color: #374151; line-height: 1.6; margin: 0 0 16px;">
      ${openingLine}
    </p>
    <p style="color: #374151; line-height: 1.6; margin: 0 0 20px;">
      You're one step closer to having your important property records, family information, and essential documents organized and protected in one secure place.
    </p>
    ${messageBlock}
    <p style="color: #374151; line-height: 1.6; margin: 0 0 10px; font-weight: 600;">How to redeem:</p>
    <ol style="color: #374151; line-height: 1.8; padding-left: 20px; margin: 0 0 25px;">
      <li>Click the secure button below.</li>
      <li>Sign in&mdash;or create an account&mdash;using <strong>${escapeHtml(d.recipientEmail)}</strong>.</li>
      <li>Your gift will be applied automatically.</li>
    </ol>
    <div style="text-align: center; margin: 0 0 20px;">
      <a href="${d.claimUrl}" style="background-color: #1e40af; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
        Redeem Your Gift
      </a>
    </div>
    <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0 0 16px;">
      This secure link is unique to you. For your protection, the gift can only be redeemed using <strong>${escapeHtml(d.recipientEmail)}</strong>.
    </p>
    <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0 0 16px;">
      Your 12-month subscription begins when your gift is activated. The gift itself does not expire before redemption.
    </p>
    <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0;">
      Setup only takes a few minutes. Once redeemed, you can create your first property and begin organizing at your own pace.
    </p>
  `, recipientRedemptionPreheader());
}

export function buildRecipientRedemptionText(d: RecipientRedemptionData): string {
  const gifter = (d.gifterName ?? "").trim();
  const openingLine = gifter.length > 0
    ? `${gifter} has gifted you a subscription to ${PLAN_NAME}.`
    : `Someone has gifted you a subscription to ${PLAN_NAME}.`;
  const message = (d.giftMessage ?? "").trim();
  const messageBlock = message.length > 0 ? `\n\nMessage from your gifter:\n"${message}"` : "";

  return `You've Received a Gift!

${openingLine}

You're one step closer to having your important property records, family information, and essential documents organized and protected in one secure place.${messageBlock}

How to redeem:
1. Open the secure link below.
2. Sign in — or create an account — using ${d.recipientEmail}.
3. Your gift will be applied automatically.

Redeem your gift: ${d.claimUrl}

This secure link is unique to you. For your protection, the gift can only be redeemed using ${d.recipientEmail}.

Your 12-month subscription begins when your gift is activated. The gift itself does not expire before redemption.

Setup only takes a few minutes. Once redeemed, you can create your first property and begin organizing at your own pace.

Questions? Contact ${SUPPORT_EMAIL}.`;
}

export interface PurchaserCodeData {
  giftCode: string;
  claimUrl: string;
  giftMessage?: string | null;
  purchaserEmail: string;
}

export function purchaserCodeSubject(): string {
  return "Your Asset Safe Gift Code is ready";
}

export function buildPurchaserCodeHtml(d: PurchaserCodeData): string {
  const message = (d.giftMessage ?? "").trim();
  const messageBlock = message.length > 0
    ? `
      <div style="background: #f8fafc; border-left: 4px solid #1e40af; padding: 12px 16px; border-radius: 4px; margin: 0 0 20px;">
        <p style="color: #374151; margin: 0; font-style: italic; white-space: pre-wrap;">"${escapeHtml(message)}"</p>
      </div>`
    : "";

  return emailShell(`
    <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 22px;">Your Asset Safe Gift Code is ready</h2>
    <p style="color: #374151; line-height: 1.6; margin: 0 0 20px;">
      Your Asset Safe Gift Code is ready. You can share this code or claim link whenever you're ready. The recipient will use it to claim their one-year subscription to ${PLAN_NAME}.
    </p>
    <div style="background: #f8fafc; border: 1px solid #dbeafe; padding: 16px; border-radius: 6px; margin: 0 0 20px;">
      <p style="color: #6b7280; font-size: 13px; margin: 0 0 6px; text-transform: uppercase; letter-spacing: .04em;">Gift Code</p>
      <p style="color: #1f2937; font-size: 24px; font-weight: 700; margin: 0;">${escapeHtml(d.giftCode)}</p>
    </div>
    <div style="text-align: center; margin: 0 0 20px;">
      <a href="${d.claimUrl}" style="background-color: #1e40af; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
        Open Claim Link
      </a>
    </div>
    <ol style="color: #374151; line-height: 1.8; padding-left: 20px; margin: 0 0 20px;">
      <li>Send the Gift Code or claim link to your recipient.</li>
      <li>They sign in or create an account.</li>
      <li>Their one-year subscription to ${PLAN_NAME} activates when they claim it.</li>
    </ol>
    ${messageBlock}
    <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0;">
      Gift Codes do not expire unless refunded, cancelled, or manually voided.
    </p>
    <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 16px 0 0;">
      Fallback claim link:<br/>
      <a href="${d.claimUrl}" style="color: #1e40af; word-break: break-all;">${d.claimUrl}</a>
    </p>
  `);
}

export function buildPurchaserCodeText(d: PurchaserCodeData): string {
  return `Your Asset Safe Gift Code is ready.

Gift Code: ${d.giftCode}
Claim Link: ${d.claimUrl}

Share this code or claim link whenever you're ready. The recipient will use it to claim their one-year subscription to ${PLAN_NAME}.

Gift Codes do not expire unless refunded, cancelled, or manually voided.

Questions? Contact ${SUPPORT_EMAIL}.`;
}
