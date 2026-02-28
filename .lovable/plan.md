
## Fix the Gift Code (ASL2025) Bypass Flow

### Problem Summary

The gift code field on the signup form ("Secure Your Account") is wired up correctly in `SignupLegacy.tsx` — it carries the code to `/welcome?giftCode=ASL2025`. However, **the full flow breaks when users click the email verification link**, which is the normal path. Here is exactly what happens:

**Current broken path:**
1. User enters `ASL2025` in the Gift Code field and submits signup
2. They are sent to `/welcome?giftCode=ASL2025` ✓
3. They receive a verification email and click the link
4. Email link goes to `/auth/callback?type=signup&redirect_to=/welcome` — **gift code is NOT in the redirect_to because `AuthContext.signUp` hardcodes it without the code**
5. `AuthCallback.tsx` sees `type=signup` and immediately redirects to `/pricing` — **ignoring `redirect_to` entirely for signup types**
6. User lands on the pricing page instead of the dashboard — **code never gets validated, payment is required**

**The only scenario where it works:** If the user stays on the `/welcome` page with the URL intact and the polling loop (`checkEmailStatus`) fires after email confirmation — but this is fragile and unusual behavior since most users will click the verification link.

---

### Root Cause — Two Bugs

**Bug 1 — `src/contexts/AuthContext.tsx` (line 169)**

`signUp()` hardcodes the email redirect URL without the gift code:

```ts
// CURRENT (broken):
const redirectUrl = `${window.location.origin}/auth/callback?type=signup&redirect_to=/welcome`;
```

This function doesn't receive the gift code so it cannot embed it. The fix is to make `signUp` accept an optional `giftCode` parameter and include it in `redirect_to` when present.

**Bug 2 — `src/pages/AuthCallback.tsx` (line 91)**

For `type=signup`, the callback ignores `redirect_to` and always sends the user to `/pricing`:

```ts
// CURRENT (broken):
navigate(isContributor ? '/account' : '/pricing', { replace: true });
```

The fix is to check if `redirect_to` is set and use it instead of hardcoding `/pricing`.

---

### Files to Change

**File 1 — `src/contexts/AuthContext.tsx`**

Update the `signUp` function signature to accept an optional `giftCode` string, and embed it into the `emailRedirectTo` URL when present:

```ts
// BEFORE:
const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
  const redirectUrl = `${window.location.origin}/auth/callback?type=signup&redirect_to=/welcome`;

// AFTER:
const signUp = async (email: string, password: string, firstName?: string, lastName?: string, giftCode?: string) => {
  const welcomePath = giftCode?.trim() 
    ? `/welcome?giftCode=${encodeURIComponent(giftCode.trim())}` 
    : '/welcome';
  const redirectUrl = `${window.location.origin}/auth/callback?type=signup&redirect_to=${encodeURIComponent(welcomePath)}`;
```

Also update the `AuthContextType` interface to include the new optional parameter on `signUp`.

**File 2 — `src/pages/SignupLegacy.tsx`**

Pass the gift code to `signUp()` when calling it:

```ts
// BEFORE:
const { error, data: signUpData } = await signUp(data.email, data.password, data.firstName, data.lastName);

// AFTER:
const { error, data: signUpData } = await signUp(data.email, data.password, data.firstName, data.lastName, data.giftCode?.trim() || undefined);
```

**File 3 — `src/pages/AuthCallback.tsx`**

For `type=signup`, use `redirect_to` when present rather than always sending to `/pricing`:

```ts
// BEFORE:
navigate(isContributor ? '/account' : '/pricing', { replace: true });

// AFTER:
if (isContributor) {
  navigate('/account', { replace: true });
} else if (redirect_to) {
  // redirect_to may be '/welcome?giftCode=ASL2025' — honor it
  navigate(redirect_to, { replace: true });
} else {
  navigate('/pricing', { replace: true });
}
```

---

### End-to-End Flow After Fix

1. User enters `ASL2025` and submits signup
2. `signUp()` is called with `giftCode = 'ASL2025'`
3. Email verification link is built as: `/auth/callback?type=signup&redirect_to=%2Fwelcome%3FgiftCode%3DASL2025`
4. User clicks verification email → lands on `/auth/callback`
5. Auth callback verifies the OTP, then redirects to `/welcome?giftCode=ASL2025` (from `redirect_to`)
6. Welcome page polls, sees email is confirmed, calls `validate-lifetime-code` with `ASL2025`
7. Edge function validates code, activates lifetime premium subscription, redirects user to `/account`
8. User lands on dashboard — no payment screen, full access granted ✓

---

### What Is NOT Changing
- The `lifetime_codes` table and `ASL2025` seed data — already exists and is active
- The `validate-lifetime-code` edge function — already correct
- The welcome page polling logic — already correct
- The contributor signup path — unchanged (still goes to `/contributor-welcome`)
- The regular (non-gift) signup path — unchanged (no `giftCode` → no `redirect_to` override → still goes to `/pricing`)
- Any database, RLS, or storage changes
