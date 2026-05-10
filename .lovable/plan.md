## What the red box said

`Account Not Found — You do not have access to that account.`

It comes from `src/contexts/AccountContext.tsx` (`switchAccount`, lines 156–165). When the target account isn't in the local `accounts` array yet, it fires this destructive toast.

## Why it briefly appeared

In `src/pages/InviteLanding.tsx` (lines 97–100), right after `accept-invite` succeeds we do:

```ts
await refreshAccount();
await switchAccount(acceptedAccountId);
```

`refreshAccount()` triggers an async `fetchAllMemberships()` and resolves, but React's `setAccounts(...)` state update is not yet visible in the same render cycle. So `switchAccount(acceptedAccountId)` reads the **stale** `accounts` array (closure value, before the new membership lands), can't find the new account, and fires the "Account Not Found" destructive toast. A moment later the new memberships propagate, the active account gets set via the existing `last_used_account_id` logic, and the user lands on `/account` correctly — which is why the toast disappears quickly.

## Is the toast necessary?

Yes — it's a real safeguard for the case where someone calls `switchAccount` with an ID they have no membership for. We shouldn't remove it. We just shouldn't trip it during the invite-accept hand-off.

The `accept-invite` edge function already pins `last_used_account_id` on the profile, so once memberships refresh, the correct account is auto-selected. The extra `switchAccount` call in `InviteLanding` is redundant — and harmful because of the race.

## The fix

In `src/pages/InviteLanding.tsx`, remove the redundant `switchAccount` call after acceptance. Keep `refreshAccount()` so the new membership shows up; rely on the edge function's `last_used_account_id` write to land the user on the right account.

```ts
if (acceptedAccountId) {
  await refreshAccount(); // memberships reload; last_used_account_id pins the right one
}
```

No other files need to change. The destructive toast in `AccountContext` stays as-is for legitimate misuse.

## Verification

After the change, walk through the AU invite → signup → redirect flow once. The accepted-invitation card should appear, then `/account` loads with no red toast in between.
