

## Harden the Authorized User Invitation Flow

### Current State (Working)

The token-based invitation flow is fully functional for all 3 roles. The `invite-contributor` function already accepts `administrator`, `contributor`, and `viewer` roles via the Zod schema. The `complete-contributor-signup` function is role-agnostic — it preserves whatever role was set in the `contributors` table. The `ContributorContext` already maps all 3 roles to the correct permissions (canEdit, canDelete, canAccessSettings, canAccessEncryptedVault).

No code changes are needed to support the other roles — they already work identically through the same flow.

### What to Harden

**1. Replace `listUsers()` with direct REST API lookup (performance + correctness)**

Both `invite-contributor` and `complete-contributor-signup` currently call `listUsers()` which fetches ALL users and filters client-side. This is a scaling risk (1000-user pagination limit) and was only used as a workaround. Replace with a direct Supabase Auth Admin REST API call to `/auth/v1/admin/users?email=...` which returns a single user efficiently.

**2. Remove dead `accept-contributor-invitation` call from AuthContext**

Line 144 of `AuthContext.tsx` fires `accept-contributor-invitation` on every login. This was the old flow. Since `complete-contributor-signup` now handles acceptance atomically during signup, this call is redundant for new invitees. However, it serves as a harmless fallback for edge cases (existing users invited to a second account), so we keep the function but add a guard comment.

**3. Add canonical flow comments to prevent regression**

Add clear header comments to `invite-contributor`, `complete-contributor-signup`, and the contributor section of `AuthLegacy.tsx` marking them as the canonical flow with a warning not to reintroduce magic links or `generate_link`.

### Files to Change

| File | Change |
|------|--------|
| `supabase/functions/invite-contributor/index.ts` | Replace `listUsers()` with direct REST lookup; add canonical flow header comment |
| `supabase/functions/complete-contributor-signup/index.ts` | Replace `listUsers()` with direct REST lookup; add canonical flow header comment |
| `src/pages/AuthLegacy.tsx` | Add header comment to contributor signup section documenting the canonical flow |

### Direct REST Lookup (replaces listUsers)

```typescript
// Efficient single-user lookup via Admin REST API
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const lookupRes = await fetch(
  `${supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(email)}`,
  { headers: { Authorization: `Bearer ${serviceRoleKey}`, apikey: serviceRoleKey } }
);
const lookupData = await lookupRes.json();
const existingUser = lookupData?.users?.[0] || null;
```

This eliminates the `listUsers()` pagination limit and scales to any number of users.

### Role Access Summary (already implemented, no changes needed)

| Role | canEdit | canDelete | canAccessSettings | canAccessEncryptedVault |
|------|---------|-----------|-------------------|------------------------|
| viewer | No | No | No | No |
| contributor | Yes | No | No | No |
| administrator | Yes | Yes | Yes | Yes |

