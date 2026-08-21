# Secure Vault: gate Legacy Locker the same way as Digital Access

## What the audit found

Both cards render through the same component, `SecureVault`, from the `legacy-locker` and `password-catalog` dashboard tabs (`src/pages/Account.tsx:420-441`). There is no second, unguarded route into Legacy Locker (`DemoLegacyLocker` and `LegacyLockerSection` are marketing stubs with no database access).

The difference is in the lock conditions:

- `SecureVault` only shows the "Secure Vault Locked" screen when `isEncrypted && !isUnlocked` (`SecureVault.tsx:620`). The `isEncrypted` value comes from the single `legacy_locker.is_encrypted` flag. When no vault passphrase has been set, that flag is false, so the parent gate never engages.
- `PasswordCatalog` (Digital Access) adds its own stricter check and blocks whenever the vault is not unlocked, regardless of the encryption flag (`PasswordCatalog.tsx:660-666`). That is why Digital Access still asks for a code.
- `LegacyLocker` adds a weaker check — it blocks only when its own independently fetched `isEncrypted` is true (`LegacyLocker.tsx:120, 425-440, 738-744`), so with the flag false it renders full content immediately.

Root cause: the two child components implement inconsistent secondary gates, and the account's vault encryption flag is currently off, so only the stricter of the two (Digital Access) locks.

Note on data: Legacy Locker rows for an unencrypted vault are stored as plaintext, so this is a genuine gap rather than a cosmetic one — the fix closes the UI path, and setting a passphrase is what actually encrypts the fields.

## The fix

1. **One gate, applied to both.** Change `SecureVault` so the vault is treated as locked whenever the session is not unlocked — not only when `is_encrypted` is true. Both sections then sit behind the same screen.
2. **First-open setup prompt.** When the user has no vault passphrase yet, the gate screen shows a "Secure your vault" setup state instead of an unlock prompt: explain that Legacy Locker and Digital Access are being protected, and let the user create a passphrase using the existing setup flow (`unlockOrUpgradeVault` in `src/lib/vaultKey.ts`, plus the existing modal already used for setup). After setup, the vault behaves exactly like an encrypted vault: locked on every fresh visit until the code is entered.
3. **Make the child gates identical.** `LegacyLocker`'s self-check becomes the same condition as `PasswordCatalog`'s (`isControlledByParent && !isUnlocked` → render nothing), removing the flag-dependent branch and the drift/race it allowed. `LegacyLocker` stops deriving lock state from its own fetch and trusts the parent signal for gating; it keeps using the flag only to decide whether stored fields need decryption.
4. **Keep existing behavior intact elsewhere.** No change to encryption/decryption, "remove encryption" path, unsaved-draft retention, contributor/admin `allow_admin_access` rules, or the auto-hide of in-memory vault keys.

## Files touched

- `src/components/SecureVault.tsx` — unified lock condition, setup-vs-unlock gate screen.
- `src/components/LegacyLocker.tsx` — align the secondary gate with Digital Access.
- Possibly the existing master-passphrase modal component, only if the setup copy needs a variant.

No database migration, RLS, or Edge Function changes.

## Verification

- Open `/account?tab=legacy-locker` on an account with no passphrase: setup screen appears, no Legacy Locker content visible.
- Create a passphrase, then reload: both Legacy Locker and Digital Access show the unlock screen and open together after one unlock.
- Reload with the vault locked: neither section leaks content, and no blank screen or error boundary trip.
- Existing encrypted account: unlock still decrypts fields correctly and drafts still survive a tab switch.
