# Keep Secure Vault / Digital Access form input intact when switching tabs

## What's happening

Verified in the code:

- `src/components/SecureVault.tsx` runs its data fetch effect with a `[user]` dependency and sets `loading` to `true` while it runs. When the browser tab regains focus, Supabase fires a `TOKEN_REFRESHED` event that produces a new `user` object, so the effect re-runs, the vault renders its loading state, and the child forms (`PasswordCatalog`, `LegacyLocker`) unmount. Anything typed but not yet saved is discarded with the component state.
- `src/components/PasswordCatalog.tsx` (Digital Access) keeps `formData`, `accountFormData`, and `editData` purely in component state with no draft persistence at all.
- `src/components/LegacyLocker.tsx` already debounce-saves a draft, but into plaintext `localStorage` under `legacyLocker_formDraft` — which both survives sign-out and stores sensitive vault content unencrypted on disk.

So the disappearing text has two causes: an avoidable remount on tab refocus, and no draft retention for Digital Access.

## The fix

### 1. Stop the remount on tab refocus (root cause)

- Change the effect dependency in `SecureVault.tsx` from `user` to `user?.id` so a token refresh for the same user no longer re-triggers the fetch (this matches the project-wide rule already used elsewhere).
- Only show the full-page loading state on the initial load; background refreshes keep the current UI mounted so child form state survives.

### 2. Add draft retention for Digital Access

- Add a small draft helper that keeps unsaved form values for the Digital Access add/edit forms and restores them if the component does remount during the same unlocked session.
- Store drafts in `sessionStorage` (cleared when the browser tab closes), not `localStorage`, and clear a draft as soon as the entry saves successfully or the user cancels/clears the form.
- Show a subtle "Unsaved draft restored" hint when a draft is re-applied so the user knows why fields are pre-filled.

### 3. Tighten the existing Legacy Locker draft

- Move the Legacy Locker draft from `localStorage` to the same `sessionStorage`-based helper, keyed per user, so sensitive vault text is not left on disk after the tab closes or the user signs out.
- Clear the draft on vault lock, sign-out, and successful save.

## Scope and safety

- No schema, storage, RLS, or Edge Function changes.
- No change to encryption, unlock/passphrase flow, permissions, or what gets written to the database — drafts are client-side only and never replace a real save.
- Files touched: `src/components/SecureVault.tsx`, `src/components/PasswordCatalog.tsx`, `src/components/LegacyLocker.tsx`, plus one new small draft-storage utility.

## Verification

- Type in a Digital Access entry, switch to another browser tab, come back: fields still populated, vault still unlocked, no loading flash.
- Same check inside Legacy Locker sections.
- Save an entry, then reopen the form: it starts empty (draft cleared).
- Sign out and back in: no leftover draft content.
