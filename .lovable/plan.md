
# Update Verification to "Any 5 of 9 Milestones" Logic

## Summary

Change the verification system so that a user becomes "Verified" when they have an active account for 14+ days AND have completed any 5 of the 9 onboarding milestones. "Verified+" remains: Verified + MFA enabled.

## Current Problem

- The backend SQL function requires ALL 5 of its criteria (email verified, 14-day account age, 10+ uploads, profile complete, has property)
- The UI shows 9 milestones and says "Complete 5 milestones to reach Verified"
- 4 milestones (contributors, documents, vault encryption, vault data + passwords, recovery delegate) are only checked client-side and never factor into verification
- A user like Michael with 5/9 UI milestones done is NOT verified because the backend uses different logic

## The 9 Milestones (for "any 5" requirement)

1. Complete Your Profile (first + last name)
2. Create Your First Property
3. Upload Your First Photos or Documents (1+ uploads, lowered from 10)
4. Add an Authorized User (1+ contributor)
5. Enable MFA
6. Upload Important Documents (1+ document-type file)
7. Enable Secure Vault Protection (Legacy Locker encrypted)
8. Add Legacy Locker and Password Catalog Details (has vault data + password entries)
9. Assign a Recovery Delegate

## Hard Gate (not a milestone)

- Account age >= 14 days -- required regardless of milestone count

## Changes

### 1. Database Migration -- Add columns to `account_verification`

Add 4 new boolean columns:
- `has_contributors` (default false)
- `has_documents` (default false)
- `has_vault_encryption` (default false)
- `has_vault_data_and_passwords` (default false)
- `has_recovery_delegate` (default false)

Also add `milestone_count` (integer, default 0) for easy querying.

### 2. Update SQL Function `compute_user_verification`

Rewrite to compute all 9 milestones plus account age:
- Keep email_verified as informational (not a milestone, not a hard gate -- it was one of the old 5 but is not in the 9 UI milestones)
- Keep account_age_met as hard gate (14 days)
- Change upload_count_met threshold from 10 to 1 (matching the UI milestone "Upload Your First Photos or Documents")
- Add queries for: contributors, documents, vault encryption, vault data + password entries, recovery delegate
- Compute milestone_count as sum of all 9 booleans
- Set is_verified = account_age_met AND milestone_count >= 5

### 3. Update Edge Function `check-verification/index.ts`

- Read and pass through all new criteria from the SQL function
- Upsert all new columns to account_verification
- Keep MFA check for Verified+ (is_verified AND has_2fa)
- Return all 9 milestone booleans in the response

### 4. Update Frontend Hook `useVerification.ts`

- Add new fields to `VerificationCriteria` interface: `has_contributors`, `has_documents`, `has_vault_encryption`, `has_vault_data_and_passwords`, `has_recovery_delegate`, `milestone_count`

### 5. Update `SecurityProgress.tsx`

- Remove client-side Supabase queries for contributors, documents, vault, passwords, recovery delegate (lines 36-63)
- Read all milestone statuses from `status.criteria` (the backend data)
- Remove the `useEffect` that fetches additional data
- Update summary text to reflect the new "any 5 of 9" logic accurately

### 6. Update `useVerification.ts` progress calculation

- Update the progress calculation to use milestone_count from backend

---

## Technical Details

### SQL Function Changes (key logic)

```sql
-- New queries added:
-- Contributors
SELECT EXISTS(SELECT 1 FROM contributors WHERE account_owner_id = target_user_id AND status = 'accepted') INTO v_has_contributors;

-- Documents
SELECT EXISTS(SELECT 1 FROM property_files WHERE user_id = target_user_id AND file_type = 'document') INTO v_has_documents;

-- Vault encryption
SELECT COALESCE((SELECT is_encrypted FROM legacy_locker WHERE user_id = target_user_id LIMIT 1), false) INTO v_has_vault_encryption;

-- Vault data + passwords
v_has_vault_data_and_passwords := (
  EXISTS(SELECT 1 FROM legacy_locker WHERE user_id = target_user_id AND (full_legal_name IS NOT NULL OR executor_name IS NOT NULL))
  AND
  EXISTS(SELECT 1 FROM password_catalog WHERE user_id = target_user_id)
);

-- Recovery delegate
SELECT EXISTS(SELECT 1 FROM legacy_locker WHERE user_id = target_user_id AND delegate_user_id IS NOT NULL) INTO v_has_recovery_delegate;

-- Upload threshold lowered to 1
v_upload_count_met := (v_upload_count >= 1);

-- Milestone count (sum of 9 booleans)
v_milestone_count := (v_profile_complete::int + v_has_property::int + v_upload_count_met::int + v_has_contributors::int + v_has_2fa::int + v_has_documents::int + v_has_vault_encryption::int + v_has_vault_data_and_passwords::int + v_has_recovery_delegate::int);

-- Verified = 14-day gate + any 5 of 9
is_verified = v_account_age_met AND (v_milestone_count >= 5)
```

### Files Modified

1. **Migration SQL** -- add columns to `account_verification`, replace `compute_user_verification` function
2. **`supabase/functions/check-verification/index.ts`** -- pass through new criteria, upsert new columns
3. **`src/hooks/useVerification.ts`** -- expand `VerificationCriteria` interface
4. **`src/components/SecurityProgress.tsx`** -- remove client-side queries, use backend data

### Important Notes

- The MFA check stays in the edge function (requires auth admin API, not available in SQL)
- The milestone count in the SQL function will count 8 milestones; the edge function adds MFA as the 9th before computing final is_verified
- The upload threshold changes from 10 to 1 to match the UI milestone wording
- email_verified is kept as a tracked field but is no longer a verification requirement (it's not one of the 9 milestones)
