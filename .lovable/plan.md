# Upgrade Asset Safe Gift Emails

## Scope
Rewrite the two Resend gift emails (purchaser confirmation, recipient redemption) in `supabase/functions/send-gift-email/index.ts`, aligning terminology ("The Asset Safe Plan"), CTAs, activation/expiration language, plain-text bodies, and adding tests. Audit related gift-flow code for stale plan-tier wording.

## Files to change

1. **`supabase/functions/send-gift-email/index.ts`** — primary rewrite
   - Purchaser (recipient-delivery) confirmation email:
     - Subject: `Your Asset Safe Gift Has Been Sent`
     - Preheader: delivery + secure redemption reassurance
     - Heading: `Gift Sent Successfully!`
     - Body uses `The Asset Safe Plan` (drop `planLabel`/`plan_type` for customer copy); include recipient name if `gift.recipient_name` is populated, else email only
     - Add value statement + "separate email with a secure link" line + closing thank-you
     - **Primary CTA**: "Send Another Gift" → `https://getassetsafe.com/gift`
     - **Secondary CTA** (outlined/quieter): "Secure Your Own Account" — resolve at send time:
       - Query `entitlements`/`profiles` for purchaser's active subscription (via `purchaser_user_id` or `purchaser_email`)
       - Active sub → `https://getassetsafe.com/account`
       - Otherwise → `https://getassetsafe.com/pricing`
       - If lookup fails → `https://getassetsafe.com/pricing` (safe default)
     - Add matching plain-text body (currently missing for this branch)
   - Recipient redemption email:
     - Subject: `{{gifter_name}} Sent You the Gift of Asset Safe` with fallback `You've Received the Gift of Asset Safe`
     - Preheader added
     - Heading unchanged: `You've Received a Gift!`
     - Opening uses `The Asset Safe Plan` (no tier); fallback "Someone has gifted you…" when `purchaser_name` missing
     - Add encouraging value statement paragraph
     - Preserve existing escaped optional gift message; skip entire callout when empty (already conditional — verify)
     - Keep 3-step "How to redeem" list
     - Single primary CTA "Redeem Your Gift" → existing secure `claimUrl` (unchanged)
     - Security reassurance kept
     - Replace `valid for 12 months from activation` with: "Your 12-month subscription begins when your gift is activated. The gift itself does not expire before redemption."
     - Add final reassurance line
     - Add plain-text body (currently missing) with same essentials + URL
   - Purchaser-code (self-delivery) email:
     - Replace `${planLabel} Plan` phrasing with `The Asset Safe Plan`
     - Keep existing content otherwise; update plain-text similarly
   - Remove `planLabel` computation where no longer used

2. **Audit-only searches** across:
   - `supabase/functions/**` (esp. `check-gift-reminders`, `check-gift-deliveries`, `redeem-gift`, `stripe-webhook`, `send-payment-receipt-internal`, `create-gift-checkout`)
   - `src/pages/Gift*.tsx`, `src/pages/GiftClaim.tsx`, `src/pages/GiftSuccess.tsx`
   - For strings: `Standard Plan`, `standard plan`, `Basic Plan`, `Premium Plan`, `subscription tier`, `plan tier`, `Thank you for giving the gift of Asset Safe`, `valid for 12 months from activation`
   - Update **active customer-facing** references only. Report (do not modify) historical migrations, archived evidence docs, and admin-only labels.

3. **Tests** — new file `supabase/functions/send-gift-email/send-gift-email_test.ts` (Deno test)
   - Extract HTML/text builders into small pure helpers in the same file (or a co-located `templates.ts`) so tests can render them with mock gift rows without hitting Resend or Supabase.
   - Cover the 22 assertions listed in the request (terminology, CTA URLs, gift message rendering + escaping, single CTA on recipient, activation wording, plain-text parity, fallback names, empty gift-message omission).
   - Idempotency + duplicate-webhook + scheduled/immediate delivery already covered by existing send logic; add lightweight assertions on the "skipped: already_sent" branch by mocking the Supabase client, or note them as covered by existing behavior and add regression assertions on the exported helpers only. (Full webhook replay tests are out of scope for this task.)

## Secondary-CTA resolution (technical detail)

Inside `send-gift-email` after loading `gift` and before rendering the purchaser HTML:

```ts
async function resolvePurchaserCta(supabase, gift): Promise<string> {
  try {
    const email = gift.purchaser_email?.toLowerCase();
    const userId = gift.purchaser_user_id;
    let hasActive = false;
    if (userId) {
      const { data } = await supabase.from('entitlements')
        .select('status').eq('user_id', userId).maybeSingle();
      hasActive = ['active', 'trialing', 'grace'].includes(data?.status);
    }
    if (!hasActive && email) {
      const { data } = await supabase.from('entitlements')
        .select('status,user_id').eq('email_hash_or_lookup', email).maybeSingle();
      hasActive = ['active', 'trialing', 'grace'].includes(data?.status);
    }
    return hasActive
      ? 'https://getassetsafe.com/account'
      : 'https://getassetsafe.com/pricing';
  } catch {
    return 'https://getassetsafe.com/pricing';
  }
}
```
(Exact entitlement lookup column will be confirmed against schema before implementation; fallback path is safe.)

## Preserved behavior (no changes)
- Resend sender `Asset Safe <noreply@assetsafe.net>`, support footer `support@assetsafe.net`
- Existing auth (`isAuthorizedInternalCall` / admin JWT), idempotent `already_sent` guard, delivery status transitions, `resend_recipient_email_id`/`resend_purchaser_email_id` persistence
- Secure `claimUrl` construction and recipient-email validation on redemption
- `redeem-gift`, gift-token model, pricing, 12-month term, storage limits
- Gift-message HTML escape via existing `escapeHtml`

## Verification
- `tsgo` (TS-only typecheck)
- `bunx vitest run` if applicable, plus Deno test for the new template tests via `supabase--test_edge_functions` on `send-gift-email`
- Deploy `send-gift-email` after edits
- Manual preview: render both email HTMLs to `/tmp/gift-preview-*.html` via a small Deno script using mock rows (with message / without message / no gifter name) and screenshot via Playwright at mobile + desktop widths
- Report any historical or admin-only tier references left in place

## Out of scope
Pricing, gift price, 12-month term, tiers, storage limits, redemption token model, recipient-email validation, other transactional emails, wider email redesign.
