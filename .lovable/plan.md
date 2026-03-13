
## Research findings — answering all three questions precisely

### Q1: Does the delegate receive the password to access the vault?

**No.** The delegate never receives the master password. The vault remains encrypted until one of two things happens:
- The owner manually approves the delegate's recovery request via the `RecoveryRequestAlert` banner in their Secure Vault (calls `respond-recovery-request` → sets `recovery_status = 'approved'`).
- The grace period expires, which triggers `send-delegate-access-email` via the scheduler (`check-grace-period-expiry`).

When access is granted (either path), the `legacy_locker.recovery_status` is set to `delegate_acknowledged` after the delegate clicks the acknowledgment link in their email. The vault data itself remains encrypted in the database — **the delegate bypasses the master password requirement entirely because the UI checks `recovery_status = 'delegate_acknowledged'` to determine access**.

However, there is a **critical gap**: after `delegate_acknowledged` is set, the app does not actually show the delegate the vault contents. The `SecureVault.tsx` component still shows the locked screen because `isDelegate` is always `false` (the same bug from the previous investigation — `isDelegate` is set by checking `data.delegate_user_id === user.id` on the *owner's own* locker row, which is never fetched for the delegate).

---

### Q2: Does the vault automatically open after the grace period? What is it? Email sent?

**Automatically opens:** The cron job (`check-grace-period-expiry`) runs and calls `send-delegate-access-email` when the grace period expires. This does NOT decrypt the data — it sets `recovery_status = 'awaiting_acknowledgment'` and sends the delegate an email with an acknowledgment link.

**Grace period:** The default is **14 days**, configurable by the owner in the Recovery Delegate selector (in `SecureVault.tsx` via `RecoveryDelegateSelector`). The owner sets this when assigning a delegate.

**Email to delegate:** Yes — `send-delegate-access-email` sends an email with a link to `/acknowledge-access?lockerId=...&delegateId=...`. The email explains responsibilities and the delegate must click "I Acknowledge — Grant Me Access".

---

### Q3: Exact steps for the delegate to gain access

**Path A — Delegate requests access (intended flow, but currently broken):**
1. Delegate logs into their own Asset Safe account
2. Delegate navigates to the Secure Vault section — they should see a "Request Emergency Access" button *(currently broken — `isDelegate` is always false, so this button is never shown)*
3. If the button were visible, delegate clicks it → `RecoveryRequestDialog` opens → delegate fills relationship + reason → calls `submit-recovery-request` edge function
4. Owner receives email notification → logs into their Secure Vault → sees `RecoveryRequestAlert` banner → approves or denies
5. If approved: delegate gets `send-recovery-approved-email` with a link to `/account` — *but this email doesn't contain an acknowledgment link; it just says "access granted" with no mechanism to actually view the vault*
6. If denied: delegate gets rejection email

**Path B — Grace period auto-expiry (the only fully working path):**
1. Owner assigns a delegate and sets grace period (14 days default) → saves in `SecureVault.tsx`
2. `check-grace-period-expiry` cron runs, detects the `grace_period_active` status has expired
3. Calls `send-delegate-access-email` → sets `recovery_status = 'awaiting_acknowledgment'`
4. Delegate receives email with link to `/acknowledge-access?lockerId=X&delegateId=Y`
5. Delegate clicks link, must be logged in (or prompted to log in)
6. Delegate checks the acknowledgment checkbox → clicks "I Acknowledge — Grant Me Access"
7. `acknowledge-delegate-access` edge function sets `recovery_status = 'delegate_acknowledged'`
8. Delegate is redirected to `/account` — *but vault content is still hidden because `isDelegate` is `false`*

---

## Summary of gaps

1. **`isDelegate` is always `false`** — delegates never see the "Request Emergency Access" button (Path A is completely broken)
2. **After approval/acknowledgment, the delegate still sees a locked vault** — even with `recovery_status = 'delegate_acknowledged'`, the `SecureVault` component doesn't check for this status to grant access
3. **The approval path (Path A) sends an email saying "access granted" but never sends the acknowledgment link** — only Path B's grace-period email has the acknowledgment URL

---

## The fix plan

Three targeted changes:

### Change 1 — Fix `isDelegate` detection in `SecureVault.tsx`

Add a second query inside `fetchVaultStatus()` that checks for any `legacy_locker` row where `delegate_user_id = user.id`. Store the result as `delegateForLocker` with its `id`, `recovery_status`, and `recovery_grace_period_days`.

```
// Current (wrong) — checks own row:
setIsDelegate(data.delegate_user_id === user.id)

// Fixed — separate query:
const { data: delegateRow } = await supabase
  .from('legacy_locker')
  .select('id, recovery_grace_period_days, recovery_status')
  .eq('delegate_user_id', user.id)
  .maybeSingle();
if (delegateRow) {
  setIsDelegate(true);
  setDelegateForLockerId(delegateRow.id);
  setDelegateRecoveryStatus(delegateRow.recovery_status);
  setGracePeriodDays(delegateRow.recovery_grace_period_days || 14);
}
```

### Change 2 — Show the delegate panel in `SecureVault.tsx`

In the locked/encrypted branch (lines 558–605), before rendering the "Unlock" button UI, check if the current user is a delegate. If so, show a dedicated panel:
- If `delegateRecoveryStatus === 'delegate_acknowledged'`: show "You have access — view vault" with a special delegate-mode unlock
- If `delegateRecoveryStatus === 'pending'` or `'awaiting_acknowledgment'`: show a status message ("Your request is pending owner approval")
- Otherwise: show the "Request Emergency Access" button that opens `RecoveryRequestDialog` with `delegateForLockerId`

### Change 3 — Fix the approval path email to include the acknowledgment link

In `send-recovery-approved-email/index.ts`, the email currently just says "access granted" with a plain `/account` link. This needs to include the `/acknowledge-access?lockerId=X&delegateId=Y` link so the delegate can actually activate their access — same as the grace period email. The `respond-recovery-request` edge function must be updated to pass `legacyLockerId` and `delegateUserId` to this email function.

---

## Files to edit

1. `src/components/SecureVault.tsx` — fix `isDelegate` + add delegate panel UI
2. `supabase/functions/respond-recovery-request/index.ts` — pass locker ID and delegate ID when calling `send-recovery-approved-email`
3. `supabase/functions/send-recovery-approved-email/index.ts` — add the acknowledgment link to the email
