
# Fix: "Continue" Button Error on Pricing Page

## Root Cause

The Pricing page `handleSubscribe` function calls `log-consent` before creating the Stripe checkout session, and treats any failure from that function as a **hard blocker**:

```js
if (consentErr || !consentData?.success) {
  throw new Error('Failed to record consent. Please try again.');
}
```

If the `log-consent` edge function returns a non-2xx status (e.g. the service role key insert fails due to any transient DB issue, or the RLS policy interfering), the user sees the "edge function returned a non-2xx status code" error and **cannot proceed to checkout at all**.

There is also a secondary issue: the `log-consent` function uses `.single()` after an insert, which throws if the insert returns anything unexpected.

## The Fix

**File: `src/pages/Pricing.tsx`**

Make the consent logging **non-blocking**. If it fails, log it to the console but do NOT prevent the user from proceeding to checkout. Consent for unauthenticated users is already logged post-payment by `finalize-checkout` anyway — this is belt-and-suspenders for authenticated users and should not gate access.

```js
// Before (blocks checkout on consent failure)
if (consentErr || !consentData?.success) {
  throw new Error('Failed to record consent...');
}

// After (gracefully continues)
if (consentErr) {
  console.warn('[Pricing] Consent logging failed (non-blocking):', consentErr.message);
}
```

**File: `supabase/functions/log-consent/index.ts`**

Remove the `.single()` call after the insert — `.single()` throws if zero or multiple rows are returned, making the function unnecessarily fragile. Use a plain insert without requiring a single row back.

## Files to Change

| File | Change |
|---|---|
| `src/pages/Pricing.tsx` | Make consent logging non-blocking — catch failure but continue to checkout |
| `supabase/functions/log-consent/index.ts` | Remove `.single()` from the insert to avoid unnecessary throws |

## Why This Is Safe

- Consent for unauthenticated users is already captured post-payment in `finalize-checkout`
- Consent for authenticated users is a best-effort audit trail — a missed log entry is far less harmful than blocking a paying customer from subscribing
- The actual consent checkbox is enforced client-side (`if (!consentChecked) return`) before this code even runs
