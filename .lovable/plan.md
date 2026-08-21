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
2. **Hard boundary, not a cover screen.** While the vault is locked or unconfigured, `SecureVault` must not mount `LegacyLocker` or `PasswordCatalog` at all, and must not initiate their protected-record fetches. The parent returns the gate screen early, before those children exist in the tree, so no protected payload reaches the browser before setup/unlock succeeds. The parent's own probe stays limited to the minimal encryption-state read it needs to decide which gate screen to show — never protected field values.
3. **First-open setup prompt.** With no passphrase yet, the gate shows a "Secure your vault" setup state: explain that Legacy Locker and Digital Access are protected by it, and create the passphrase through the existing setup flow (`unlockOrUpgradeVault` in `src/lib/vaultKey.ts` plus the existing passphrase modal). For an existing account with plaintext data, setup is only treated as complete once the existing plaintext fields have been encrypted and `is_encrypted` is set to true; if that encryption step fails, the vault stays in the setup state with an error rather than reporting success. After setup, the vault behaves like any encrypted vault: locked on every fresh visit.
4. **Single unlock covers both.** One successful unlock opens Legacy Locker and Digital Access together, and stays open until the existing in-memory key timeout, sign-out, idle logout, or an explicit lock — unchanged from today.
5. **Make the child gates identical.** `LegacyLocker`'s self-check becomes the same condition as `PasswordCatalog`'s (`isControlledByParent && !isUnlocked` → render nothing), removing the flag-dependent branch and the drift/race it allowed. It keeps the flag only to decide whether stored fields need decryption.
6. **Retire "Remove encryption".** Since vault protection becomes mandatory, a user can no longer return these sections to an unencrypted state — removing encryption would just force an immediate re-setup. The "Remove encryption" action and its UI are removed from Secure Vault. Retained controls: change passphrase, lock vault, recovery/delegate access where it already exists, and Authorized User access management. The underlying decrypt helper stays only where recovery/delegate flows depend on it; no user-facing path can flip `is_encrypted` back to false.
7. **Rule for the future.** Anything placed inside Secure Vault inherits the parent gate by being mounted only after unlock, rather than implementing its own security check.

## Files touched

- `src/components/SecureVault.tsx` — unified lock condition, early-return gate before children mount, setup-vs-unlock gate screen, removal of the "Remove encryption" action.
- `src/components/LegacyLocker.tsx` — align the secondary gate with Digital Access; ensure protected fetches only run when mounted unlocked.
- `src/components/PasswordCatalog.tsx` — only if a fetch currently starts before the unlock signal.
- Possibly the existing passphrase modal, only if the setup copy needs a variant.

No database migration, RLS, or Edge Function changes.

## Verification

Primary regression — existing plaintext account with no passphrase:

- Open `/account?tab=legacy-locker`: "Secure your vault" screen appears.
- Confirm via the network panel that no `legacy_locker` or `password_catalog` content request fires before setup.
- Create a passphrase; confirm existing fields are encrypted, `is_encrypted` is true, and a database read shows sensitive fields are no longer plaintext.
- Unlock and confirm all prior information still displays correctly.
- Reload: vault locks again and requires the code.

Other cases:

- Existing encrypted account: unlock still decrypts correctly; drafts survive a tab switch.
- One unlock opens both Legacy Locker and Digital Access; neither leaks content while locked, and no blank screen or error-boundary trip.
- No "Remove encryption" control remains anywhere in Secure Vault.
