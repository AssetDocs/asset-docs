

## Dynamic Lock Icon for Legacy Locker and Password Catalog

### What Changes
The lock icon overlay on the Legacy Locker and Password Catalog dashboard cards will dynamically reflect whether the Secure Vault is encrypted or not:

- **Locked (encrypted)**: Closed lock icon (current behavior)
- **Unlocked (not encrypted)**: Open lock icon with an amber/yellow warning indicator

### Technical Details

**1. Create a hook to fetch vault encryption status**
- New file: `src/hooks/useVaultEncryptionStatus.ts`
- Queries the `legacy_locker` table for the current user's `is_encrypted` field
- Returns `{ isEncrypted: boolean, loading: boolean }`
- Simple, lightweight query -- no need for the full SecureVault logic

**2. Update `DashboardGrid.tsx`**
- Import the new hook and `LockKeyhole` + `LockOpen` from lucide-react
- Replace the static `🔒` emoji on both the Legacy Locker and Password Catalog cards with:
  - `LockKeyhole` icon (closed lock) when `isEncrypted` is true -- shown in red/amber
  - `LockOpen` icon (open lock) with an `AlertTriangle` or exclamation-style indicator when `isEncrypted` is false -- shown in amber/warning color to subtly encourage encryption
- The badge text will also update: "Encrypted" vs "Not Encrypted"

**3. Files to modify**
- `src/hooks/useVaultEncryptionStatus.ts` (new)
- `src/components/DashboardGrid.tsx` (update badge logic for 2 cards)

