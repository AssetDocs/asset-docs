import { assert, assertEquals, assertStringIncludes, assertFalse } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  ACCOUNT_URL,
  GIFT_URL,
  PLAN_NAME,
  PRICING_URL,
  buildPurchaserConfirmationHtml,
  buildPurchaserConfirmationText,
  buildRecipientRedemptionHtml,
  buildRecipientRedemptionText,
  purchaserConfirmationSubject,
  recipientRedemptionSubject,
} from "./templates.ts";

// --- Purchaser confirmation ---

Deno.test("purchaser confirmation uses The Asset Safe Plan and recipient email", () => {
  const html = buildPurchaserConfirmationHtml({
    recipientEmail: "recipient@example.com",
    secondaryCtaUrl: PRICING_URL,
  });
  assertStringIncludes(html, PLAN_NAME);
  assertStringIncludes(html, "recipient@example.com");
  assertFalse(html.includes("Standard Plan"));
  assertFalse(html.includes("Plan Plan"));
});

Deno.test("purchaser confirmation shows recipient name when available", () => {
  const html = buildPurchaserConfirmationHtml({
    recipientEmail: "recipient@example.com",
    recipientName: "Example Recipient",
    secondaryCtaUrl: PRICING_URL,
  });
  assertStringIncludes(html, "Example Recipient");
  assertStringIncludes(html, "recipient@example.com");
});

Deno.test("purchaser confirmation primary CTA links to production gift page", () => {
  const html = buildPurchaserConfirmationHtml({
    recipientEmail: "r@example.com",
    secondaryCtaUrl: PRICING_URL,
  });
  assertStringIncludes(html, `href="${GIFT_URL}"`);
  assertStringIncludes(html, "Send Another Gift");
});

Deno.test("purchaser confirmation secondary CTA uses provided account/pricing URL", () => {
  const htmlActive = buildPurchaserConfirmationHtml({
    recipientEmail: "r@example.com",
    secondaryCtaUrl: ACCOUNT_URL,
  });
  assertStringIncludes(htmlActive, `href="${ACCOUNT_URL}"`);
  assertStringIncludes(htmlActive, "Secure Your Own Account");

  const htmlInactive = buildPurchaserConfirmationHtml({
    recipientEmail: "r@example.com",
    secondaryCtaUrl: PRICING_URL,
  });
  assertStringIncludes(htmlInactive, `href="${PRICING_URL}"`);
});

Deno.test("purchaser confirmation subject line", () => {
  assertEquals(purchaserConfirmationSubject(), "Your Asset Safe Gift Has Been Sent");
});

Deno.test("purchaser confirmation plain-text mirrors HTML essentials", () => {
  const txt = buildPurchaserConfirmationText({
    recipientEmail: "recipient@example.com",
    recipientName: "Example Recipient",
    secondaryCtaUrl: ACCOUNT_URL,
  });
  assertStringIncludes(txt, PLAN_NAME);
  assertStringIncludes(txt, "recipient@example.com");
  assertStringIncludes(txt, "Example Recipient");
  assertStringIncludes(txt, GIFT_URL);
  assertStringIncludes(txt, ACCOUNT_URL);
  assertStringIncludes(txt, "support@assetsafe.net");
});

// --- Recipient redemption ---

Deno.test("recipient subject uses gifter name when available", () => {
  assertEquals(
    recipientRedemptionSubject("Michael Lewis"),
    "Michael Lewis Sent You the Gift of Asset Safe",
  );
});

Deno.test("recipient subject falls back when gifter name missing", () => {
  assertEquals(recipientRedemptionSubject(""), "You've Received the Gift of Asset Safe");
  assertEquals(recipientRedemptionSubject(null), "You've Received the Gift of Asset Safe");
});

Deno.test("recipient redemption uses The Asset Safe Plan and gifter name", () => {
  const html = buildRecipientRedemptionHtml({
    gifterName: "Michael Lewis",
    recipientEmail: "recipient@example.com",
    claimUrl: "https://getassetsafe.com/gift-claim?code=X&token=Y",
  });
  assertStringIncludes(html, PLAN_NAME);
  assertStringIncludes(html, "Michael Lewis");
  assertFalse(html.includes("Standard Plan"));
  assertFalse(html.includes("Plan Plan"));
});

Deno.test("recipient redemption includes encouraging value statement", () => {
  const html = buildRecipientRedemptionHtml({
    gifterName: "Michael Lewis",
    recipientEmail: "r@example.com",
    claimUrl: "https://getassetsafe.com/gift-claim?code=X&token=Y",
  });
  assertStringIncludes(html, "one step closer");
  assertStringIncludes(html, "organized and protected");
});

Deno.test("recipient redemption renders optional gift message when provided", () => {
  const html = buildRecipientRedemptionHtml({
    gifterName: "Michael",
    recipientEmail: "r@example.com",
    giftMessage: "Happy birthday!",
    claimUrl: "https://getassetsafe.com/gift-claim?code=X&token=Y",
  });
  assertStringIncludes(html, "Happy birthday!");
  assertStringIncludes(html, "border-left: 4px solid #1e40af");
});

Deno.test("recipient redemption omits gift-message callout when empty", () => {
  const html = buildRecipientRedemptionHtml({
    gifterName: "Michael",
    recipientEmail: "r@example.com",
    giftMessage: "   ",
    claimUrl: "https://getassetsafe.com/gift-claim?code=X&token=Y",
  });
  assertFalse(html.includes("border-left: 4px solid #1e40af"));
});

Deno.test("recipient redemption escapes gift message HTML", () => {
  const html = buildRecipientRedemptionHtml({
    gifterName: "Michael",
    recipientEmail: "r@example.com",
    giftMessage: "<script>alert('x')</script>",
    claimUrl: "https://getassetsafe.com/gift-claim?code=X&token=Y",
  });
  assertFalse(html.includes("<script>alert"));
  assertStringIncludes(html, "&lt;script&gt;");
});

Deno.test("recipient redemption has only one Redeem Your Gift CTA", () => {
  const html = buildRecipientRedemptionHtml({
    gifterName: "Michael",
    recipientEmail: "r@example.com",
    claimUrl: "https://getassetsafe.com/gift-claim?code=X&token=Y",
  });
  const matches = html.match(/Redeem Your Gift/g) ?? [];
  assertEquals(matches.length, 1);
  // no upsell buttons
  assertFalse(html.includes("Learn More"));
  assertFalse(html.includes(PRICING_URL));
});

Deno.test("recipient redemption preserves secure claim URL", () => {
  const claim = "https://getassetsafe.com/gift-claim?code=ABC&token=SECRET";
  const html = buildRecipientRedemptionHtml({
    gifterName: "Michael",
    recipientEmail: "r@example.com",
    claimUrl: claim,
  });
  assertStringIncludes(html, `href="${claim}"`);
});

Deno.test("recipient redemption keeps recipient-email restriction language", () => {
  const html = buildRecipientRedemptionHtml({
    gifterName: "Michael",
    recipientEmail: "recipient@example.com",
    claimUrl: "https://x/",
  });
  assertStringIncludes(html, "can only be redeemed using");
  assertStringIncludes(html, "recipient@example.com");
});

Deno.test("recipient redemption clarifies 12-month activation and non-expiration", () => {
  const html = buildRecipientRedemptionHtml({
    gifterName: "M",
    recipientEmail: "r@example.com",
    claimUrl: "https://x/",
  });
  assertStringIncludes(html, "12-month subscription begins when your gift is activated");
  assertStringIncludes(html, "gift itself does not expire before redemption");
  assertFalse(html.includes("valid for 12 months from activation"));
});

Deno.test("recipient redemption plain-text mirrors HTML essentials", () => {
  const txt = buildRecipientRedemptionText({
    gifterName: "Michael Lewis",
    recipientEmail: "recipient@example.com",
    giftMessage: "Happy birthday!",
    claimUrl: "https://getassetsafe.com/gift-claim?code=X&token=Y",
  });
  assertStringIncludes(txt, PLAN_NAME);
  assertStringIncludes(txt, "Michael Lewis");
  assertStringIncludes(txt, "Happy birthday!");
  assertStringIncludes(txt, "https://getassetsafe.com/gift-claim?code=X&token=Y");
  assertStringIncludes(txt, "12-month subscription begins");
  assertStringIncludes(txt, "does not expire before redemption");
  assertStringIncludes(txt, "support@assetsafe.net");
});

Deno.test("recipient redemption falls back when gifter name missing", () => {
  const html = buildRecipientRedemptionHtml({
    gifterName: "",
    recipientEmail: "r@example.com",
    claimUrl: "https://x/",
  });
  assertStringIncludes(html, "Someone has gifted you");
});

Deno.test("no active gift email references Standard Plan", () => {
  const purchaser = buildPurchaserConfirmationHtml({
    recipientEmail: "r@example.com",
    secondaryCtaUrl: PRICING_URL,
  });
  const recipient = buildRecipientRedemptionHtml({
    gifterName: "M",
    recipientEmail: "r@example.com",
    claimUrl: "https://x/",
  });
  for (const html of [purchaser, recipient]) {
    assertFalse(/Standard Plan/i.test(html));
    assertFalse(/Basic Plan/i.test(html));
    assertFalse(/Premium Plan/i.test(html));
  }
});
