
# Service Role Key — Full Usage Audit

**Scope:** 43 edge functions, all frontend files, all `src/` TypeScript
**Key finding upfront:** The `SUPABASE_SERVICE_ROLE_KEY` is **never referenced in any frontend file**. All 43 usages are exclusively inside `supabase/functions/`. This is correct.

---

## PART 1 — Frontend Exposure

**Status: CLEAN**

The only appearances of `SUPABASE_SERVICE_ROLE_KEY` in `src/` are:
- `src/components/admin/SystemInfrastructure.tsx` — displays the *name* of the secret as a documentation string (not the value)
- `src/integrations/supabase/types.ts` — references the function signature of `validate_service_role_context` (a DB function name)

Neither file reads, imports, or uses the actual key. The frontend Supabase client uses only `VITE_SUPABASE_PUBLISHABLE_KEY` (the anon key). **No leakage risk from the frontend layer.**

---

## PART 2 — Edge Function Inventory (All 43 usages)

### Group A — Scheduled / System Functions (No auth required by design)

These functions are intended to be triggered by cron jobs, not user-initiated requests. They use `service_role` directly without JWT validation.

| Function | Purpose | Auth Check |
|----------|---------|------------|
| `check-payment-failures` | Scans all subscribers for expired cards | None |
| `check-gift-reminders` | Sends gift subscription renewal reminders | None |
| `check-grace-period-expiry` | Auto-escalates recovery requests when grace period expires | None |

**Finding GS-1 — No authentication on scheduled functions — Medium**

These functions call `service_role` and perform cross-user scans (all subscribers, all legacy lockers) without any authentication check. If an attacker discovers the function URL, they can call them at will:
- `check-payment-failures` iterates all subscribers with `subscribed = true`, reads their `stripe_customer_id`, and calls Stripe's API for each.
- `check-gift-reminders` iterates all gift subscriptions and sends emails.
- `check-grace-period-expiry` reads all `legacy_locker` rows with active grace periods and calls `auth.admin.getUserById()` for both the owner and delegate.

These functions don't modify sensitive data, but they expose existence of certain records via invocation timing (side channels) and could trigger unwanted email sends.

**Recommended pattern:**
```typescript
// At top of each scheduled function, verify it's called from Supabase's scheduler
// (passes a known secret header) or limit to POST with a shared secret:
const internalSecret = req.headers.get('x-internal-secret');
const expectedSecret = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
if (internalSecret !== expectedSecret) {
  return new Response('Unauthorized', { status: 401 });
}
```
Note: `check-grace-period-expiry` already passes `x-internal-secret: supabaseServiceKey` when calling `send-delegate-access-email`. The same guard should be applied to itself and the other two scheduled functions.

---

### Group B — User-Authenticated Functions (JWT validated, then service_role used)

These are the correct pattern: validate JWT first with anon client, then use service_role for privileged operations.

| Function | Auth Pattern | service_role Operations |
|----------|-------------|------------------------|
| `check-subscription` | JWT via service_role.auth.getUser | Reads own entitlements + contributor's owner entitlements |
| `sync-subscription` | JWT via service_role.auth.getUser | Upserts entitlements, profiles, subscribers for `user.id` only |
| `delete-account` | JWT via anon client | Deletes all data for `targetAccountId` |
| `accept-contributor-invitation` | JWT via anon client | Updates contributors table for `user.email` |
| `respond-deletion-request` | JWT via anon client | Updates `account_deletion_requests` for verified owner |
| `validate-lifetime-code` | JWT claims via anon client | Upserts subscribers, entitlements, profiles for `user_id` |
| `manage-backup-codes` | JWT via anon client | Reads/writes backup codes for verified user |
| `check-verification` | JWT via anon client | Calls `compute_user_verification` for verified user |
| `invite-contributor` | JWT via service_role.auth.getUser | Inserts contributor for `callerUser.id`, sends invite |
| `customer-portal` | JWT via service_role.auth.getUser | Reads subscriber for `user.id`, creates Stripe portal |
| `cancel-subscription` | JWT verification | Cancels Stripe subscription for verified user |
| `change-plan` | JWT claims via anon client | Updates entitlements/profiles/subscribers for `userId` |
| `payment-history` | JWT via service_role.auth.getUser | Reads payment_events for `user.id` only |

**Finding B-1 — `delete-account` accepts an arbitrary `target_account_id` from the request body — Medium**

```typescript
// delete-account/index.ts lines 75-82
const body = await req.json();
if (body.target_account_id && body.target_account_id !== user.id) {
  targetAccountId = body.target_account_id;
  isAdminDeletion = true;
}
```

A client can pass any `target_account_id` UUID in the request body. The function then checks if the caller is an `administrator` contributor to that account, which is correct. However, the `targetAccountId` is accepted from client input and used directly in 15+ `supabase.admin.delete()` and table-level `.delete().eq('user_id', targetAccountId)` calls. If the contributor check logic has any flaw, the attacker controls which account gets fully wiped.

**Recommendation:** Validate `target_account_id` is a valid UUID before use, and verify the contributor record's `account_owner_id` matches the client-supplied `target_account_id` before proceeding — which it does at line 99-123. This is functionally safe but relies on the contributor lookup being correct. Consider adding an explicit UUID format check to fail early.

**Finding B-2 — `validate-lifetime-code` uses a static hardcoded list — Medium**

```typescript
const LIFETIME_CODES = ["ASL2025"];
```

The code list is hardcoded in the edge function. There is no rate limiting or per-user tracking: a valid authenticated user can apply the same code as many times as they want (each call just upserts the same data). More critically, if `ASL2025` is ever shared publicly, any authenticated user can activate a free lifetime premium subscription. The code cannot be revoked without redeploying the function.

**Recommendation:** Store lifetime codes in a `lifetime_codes` table with `code`, `max_uses`, `times_redeemed`, and `expires_at` columns. Use service_role to atomically check-and-decrement. This also allows revocation.

**Finding B-3 — `change-plan` creates new Stripe products/prices on every call — Medium**

```typescript
const product = await stripe.products.create({ name: priceConfig.product_name });
const newPrice = await stripe.prices.create({ ... });
```

Every plan change call creates a new Stripe product and price object rather than using existing lookup keys. Over time this pollutes the Stripe product catalog with duplicate entries. More critically: if the function is called twice rapidly (e.g., double-click), it would create two Stripe product/price pairs and update the subscription twice. There's no idempotency key.

**Recommendation:** Use `stripe.prices.list({ lookup_key: targetLookupKey })` to find the existing price, or set `lookup_key` on prices at creation time and retrieve by it. This also aligns with how `stripe-webhook` and `sync-subscription` identify plans.

**Finding B-4 — `invite-contributor` calls `auth.admin.listUsers()` with no pagination — Low**

```typescript
const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
const existingUser = existingUsers?.users?.find(u => u.email?.toLowerCase() === validated.contributor_email.toLowerCase());
```

`auth.admin.listUsers()` with no parameters defaults to the first 1,000 users. If the platform grows beyond 1,000 users, invitations to emails of users created after position 1,000 will always generate a new auth invite rather than detecting the existing account. This is the same pattern found in `admin-stripe-subscriptions`. Both should use `listUsers({ perPage: 1000 })` with pagination, or better: look up by email directly via `admin.getUserByEmail()`.

**Recommendation:**
```typescript
// Instead of listing all users:
const { data: existingUserData } = await supabaseAdmin.auth.admin.getUserByEmail(
  validated.contributor_email
);
const existingUser = existingUserData?.user;
```

---

### Group C — Admin-Only Functions (service_role + admin role check)

These functions verify `user_roles.role = 'admin'` before proceeding.

| Function | Admin Check | Cross-User Operations |
|----------|------------|----------------------|
| `admin-stripe-subscriptions` | user_roles 'admin' | Lists ALL Stripe subscriptions + ALL profiles |
| `admin-link-stripe-customer` | user_roles 'admin' | Updates any user's profile + subscribers by client-supplied `userId` |
| `admin-get-user-emails` | has_owner_workspace_access RPC | Lists all auth.users emails |

**Finding C-1 — `admin-link-stripe-customer` accepts arbitrary `userId` from request body — Medium**

```typescript
const { action, stripeCustomerId, userId, subscriptionId } = await req.json();
// ...
.update({ stripe_customer_id: stripeCustomerId, plan_id: planId, ... })
.eq("user_id", userId);
```

An admin user can pass any `userId` in the request body and the function will update that user's `profile` and `subscriber` records with any `stripeCustomerId`. While this requires admin role, the admin can modify any user's billing state with arbitrary Stripe IDs. There is no check that the supplied `stripeCustomerId` actually belongs to the `userId` or is a valid Stripe customer.

**Recommendation:** After fetching the Stripe customer, verify `customer.email` matches the target user's email from `auth.admin.getUserById(userId)` before applying the link. This prevents an admin from maliciously or accidentally linking wrong billing data.

---

### Group D — Stripe Webhook (No user auth by design — cryptographic source verification)

`stripe-webhook` uses `service_role` with no JWT check. This is correct: webhook events come from Stripe, not from users. Authentication is via `stripe.webhooks.constructEvent(body, signature, webhookSecret)` — cryptographic HMAC verification of the Stripe-Signature header. **This is the correct pattern for Stripe webhooks.**

---

### Group E — Background Email Functions (service_role, no user auth)

Functions like `send-cancellation-notice`, `send-subscription-welcome-email`, `send-property-update`, etc. all use `service_role` to fetch data needed to compose emails (user profile, property details). These are invoked by other edge functions or the webhook, not directly by users. They use service_role only to read the data needed for the email — no writes are made to sensitive tables.

**Finding E-1 — `send-property-update` does not validate caller identity — Low**

This function reads property data and sends email notifications. It accepts `property_id` from the request body without verifying the caller is the property owner. It's called internally from property update flows, but if the URL is known, any authenticated user could trigger a notification email for any property.

---

## PART 3 — Full Risk Matrix

| Function | Finding | Severity | Type |
|----------|---------|----------|------|
| `check-payment-failures` | No auth check — callable by anyone | **Medium** | Missing auth guard |
| `check-gift-reminders` | No auth check — callable by anyone | **Medium** | Missing auth guard |
| `check-grace-period-expiry` | No auth check — callable by anyone | **Medium** | Missing auth guard |
| `delete-account` | Accepts `target_account_id` from body; relies on contributor check being correct | **Medium** | Client-controlled scope |
| `validate-lifetime-code` | Hardcoded codes, no usage cap, no revocation mechanism | **Medium** | Static secret |
| `change-plan` | Creates new Stripe products/prices per call; no idempotency | **Medium** | Resource pollution |
| `admin-link-stripe-customer` | No cross-validation that Stripe customer email matches target user | **Medium** | Input trust |
| `invite-contributor` | `listUsers()` with 1000-cap; misses users beyond position 1000 | **Low** | Pagination gap |
| `admin-stripe-subscriptions` | Same `listUsers()` pagination gap | **Low** | Pagination gap |
| `send-property-update` | No caller validation for property ownership | **Low** | Missing ownership check |
| `track` | `service_role` used for an anonymous-compatible operation; could use anon + RLS | **Low** | Over-privileged client |

---

## PART 4 — Functions Where service_role Could Be Downgraded to anon + RLS

These functions use `service_role` for operations that RLS could handle:

| Function | Current | Safer Alternative |
|----------|---------|------------------|
| `track` | service_role INSERT into `events` | anon client + INSERT policy `WITH CHECK (auth.uid() = user_id OR user_id IS NULL)` |
| `send-property-update` | service_role SELECT on `properties` | anon client with the caller's JWT — they already own the property |
| `sync-subscription` | service_role UPSERT into entitlements/profiles/subscribers | service_role is correct here because subscriber data must bypass RLS to sync from Stripe |

The `track` function is the clearest case: it's a write-only analytics insert that accepts unauthenticated calls (user_id may be null for anonymous visitors). Using service_role for this means a single compromised JWT or SSRF could fill the `events` table with arbitrary data. The anon client with a permissive INSERT policy would accomplish the same without exposing service-level privileges.

---

## Summary Recommendations (Prioritized)

### P0 — Add caller authentication to all scheduled functions
Add `x-internal-secret` header validation to `check-payment-failures`, `check-gift-reminders`, and `check-grace-period-expiry`. This prevents arbitrary external callers from triggering mass email sends or Stripe API calls.

### P1 — Move lifetime codes to a database table
Replace the hardcoded `LIFETIME_CODES` array with a `lifetime_codes` table that tracks `max_uses` and `times_redeemed`. Add a usage check with an atomic update to prevent replay.

### P2 — Fix `invite-contributor` and `admin-stripe-subscriptions` to use `getUserByEmail`
Replace `listUsers()` + `.find()` with `auth.admin.getUserByEmail(email)` to avoid the 1,000-user pagination gap.

### P3 — Add Stripe customer email cross-validation in `admin-link-stripe-customer`
Before updating a user's billing profile, verify `stripe_customer.email === auth_user.email`.

### P4 — Downgrade `track` function to anon + RLS
Remove service_role from the analytics tracking function; add a permissive INSERT RLS policy on the `events` table instead.
