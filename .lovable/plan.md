
## Entitlement Source Classification and Audit Hardening

This plan adds an explicit `entitlement_source` field to distinguish between Stripe-backed, lifetime/code-based, and admin-granted subscriptions. This eliminates false audit anomalies and enforces data integrity rules per source type.

---

### 1. Add `entitlement_source` column and backfill

**Database migration:**

- Add column `entitlement_source TEXT NOT NULL DEFAULT 'stripe'` with a CHECK constraint limiting values to `'stripe'`, `'lifetime'`, `'admin'`
- Backfill existing records:
  - Records with `stripe_subscription_id IS NOT NULL` -> `'stripe'`
  - Records with `plan != 'free'` AND `stripe_subscription_id IS NULL` -> `'admin'` (covers user 5950acba)
  - All remaining `free/inactive` records stay as `'stripe'` (default, harmless -- they have no active entitlement)

---

### 2. Add Stripe-source safety constraint (database trigger)

**Database migration:**

Create a validation trigger on the `entitlements` table that enforces:
- If `entitlement_source = 'stripe'` AND `status IN ('active', 'trialing')`, then `stripe_subscription_id`, `stripe_customer_id`, `stripe_plan_price_id`, and `plan_lookup_key` must all be non-null
- Rejects writes that violate this, preventing half-billed customers

---

### 3. Normalize admin/lifetime storage defaults (database trigger)

**Database migration:**

Create or extend the validation trigger so that on INSERT or UPDATE:
- If `entitlement_source IN ('admin', 'lifetime')`:
  - When `plan = 'standard'`, force `base_storage_gb = 25`
  - When `plan = 'premium'`, force `base_storage_gb = 100`
  - Recompute `total_storage_gb = base_storage_gb + (storage_addon_blocks_qty * 25)`

Also run a one-time UPDATE to fix user 5950acba's storage (premium with 0GB -> 100GB).

---

### 4. Update `validate-lifetime-code` edge function

**File:** `supabase/functions/validate-lifetime-code/index.ts`

- Add an upsert to the `entitlements` table (currently missing -- it only writes to `subscribers` and `profiles`)
- Set `entitlement_source = 'lifetime'`, `plan = 'premium'`, `status = 'active'`, `base_storage_gb = 100`, `total_storage_gb = 100`
- This ensures lifetime codes create proper entitlement records going forward

---

### 5. Update `stripe-webhook` and `sync-subscription` to set source

**Files:**
- `supabase/functions/stripe-webhook/index.ts` -- Add `entitlement_source: 'stripe'` to all entitlement upserts
- `supabase/functions/sync-subscription/index.ts` -- Add `entitlement_source: 'stripe'` to all entitlement upserts

This is belt-and-suspenders: the column defaults to `'stripe'`, but being explicit prevents confusion.

---

### 6. Update `check-subscription` to return `entitlement_source`

**File:** `supabase/functions/check-subscription/index.ts`

- Include `entitlement_source` in the response object so the frontend and audit tools can see the billing provenance

---

### 7. Add billing provenance badge in admin UI

**File:** `src/components/admin/AdminUsers.tsx`

- Display a non-editable badge (Stripe / Lifetime / Admin) next to each user in the admin dashboard, derived from the `entitlement_source` field on the entitlements table
- Color coding: Stripe = blue, Lifetime = purple, Admin = amber

---

### Summary of changes

| Area | What changes |
|------|-------------|
| Database | New column `entitlement_source`, validation trigger, backfill + fix 5950's storage |
| `validate-lifetime-code` | Write to `entitlements` table with `source = 'lifetime'` |
| `stripe-webhook` | Explicitly set `entitlement_source: 'stripe'` |
| `sync-subscription` | Explicitly set `entitlement_source: 'stripe'` |
| `check-subscription` | Return `entitlement_source` in response |
| Admin UI | Show provenance badge per user |

### What this does NOT do (intentionally)
- Does not auto-create Stripe subscriptions for non-Stripe users
- Does not backfill fake Stripe IDs
- Does not assign lookup keys to admin/lifetime entitlements
- Does not delete legacy test users
