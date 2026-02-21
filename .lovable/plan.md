

## Streamline New User Account Creation Flow

### Current Flow (Problems)
1. User signs up at `/signup`
2. Gets redirected to `/auth` (login page) with a small toast notification saying "check your email"
3. After clicking email verification link, user lands on `/account` (dashboard) directly
4. The `ProtectedRoute` component has an `allowFreeAccess` fallback that lets unpaid users into the dashboard

### Desired Flow
1. User creates account at `/signup`
2. User is redirected to `/welcome` -- a prominent, quarter-page (or larger) verification prompt that stays on screen until email is verified (this page already exists and polls for verification status)
3. After email verification, user is redirected to `/pricing` to choose and pay for a subscription
4. Only after payment can the user access the dashboard

### Changes Required

**1. Signup page (`src/pages/SignupLegacy.tsx`)**
- After successful signup, redirect to `/welcome` instead of `/auth`
- Remove the small toast that says "check your email and sign in" -- the Welcome page already handles this messaging prominently

**2. Welcome / Email Verification page (`src/pages/Welcome.tsx`)**
- After email is confirmed, redirect to `/pricing` instead of `/auth`
- Update messaging: once verified, tell the user "Email verified! Redirecting to choose your plan..."
- Keep the existing full-page layout (already meets the "quarter page" requirement -- it's actually full-screen)

**3. Auth Callback (`src/pages/AuthCallback.tsx`)**
- For `type === 'signup'` (email verification click), redirect to `/pricing` instead of `/account`
- This handles the case where the user clicks the verification link directly

**4. ProtectedRoute in `src/App.tsx`**
- Remove the `allowFreeAccess` bypass that currently lets unpaid users into the dashboard
- Users without an active subscription (and without contributor access) should be redirected to `/pricing`
- Keep the existing `skipSubscriptionCheck` flag for routes like `/subscription-success`

### Technical Details

```
Signup (/signup)
    |
    v
Welcome Page (/welcome) -- full-screen verification prompt, polls every 3s
    |  (email verified)
    v
Pricing Page (/pricing) -- user selects plan and pays via Stripe
    |  (payment complete)
    v
Dashboard (/account) -- ProtectedRoute enforces active subscription
```

**Files to modify:**
- `src/pages/SignupLegacy.tsx` -- change post-signup redirect from `/auth` to `/welcome`
- `src/pages/Welcome.tsx` -- change post-verification redirect from `/auth` to `/pricing`
- `src/pages/AuthCallback.tsx` -- change signup callback redirect from `/account` to `/pricing`
- `src/App.tsx` -- remove `allowFreeAccess` bypass in `ProtectedRoute` so unpaid users are sent to `/pricing`

