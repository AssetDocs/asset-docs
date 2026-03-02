
# Fix: Magic Link Email Not Delivered — Wrong Sender Domain

## Root Cause

The `finalize-checkout` function sends the magic link email from:
```
Asset Safe <noreply@getassetsafe.com>
```

But `getassetsafe.com` is **not verified in Resend**. Every other email-sending edge function in the project correctly uses `noreply@assetsafe.net`, which is the verified Resend domain.

The Resend API returns a `403 validation_error` and the email is silently swallowed because the error is marked as `non-fatal` in the function code — meaning the success page still shows "check your inbox," but no email arrives.

## The Fix — One Line

**File: `supabase/functions/finalize-checkout/index.ts` (line 194)**

Change:
```typescript
from: "Asset Safe <noreply@getassetsafe.com>",
```

To:
```typescript
from: "Asset Safe <noreply@assetsafe.net>",
```

## Why This Works

- `assetsafe.net` is the verified Resend domain used by all other edge functions (send-security-alert, send-auth-email, send-gift-email, send-payment-reminder, invite-dev-team-member)
- Resend requires the `from` address domain to match a verified domain on the account
- This single change aligns `finalize-checkout` with every other function in the project

## Files to Change

| File | Change |
|---|---|
| `supabase/functions/finalize-checkout/index.ts` | Change `from` address domain from `getassetsafe.com` → `assetsafe.net` |

## No Other Changes Needed

The rest of the magic link flow (generation, URL construction, email body) is correct. The only failure point was the mismatched sender domain.
