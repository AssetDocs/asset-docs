
## Add "Remove Encryption" Option to the Secure Vault

### Current Behavior
Once a user enables encryption, the toggle becomes permanently disabled. There is no way to reverse it. All password catalog entries and legacy locker data are stored as AES-256-GCM ciphertext in the database.

### Proposed Flow
Allow users to remove encryption by:
1. Requiring them to enter their master password (to prove they have access)
2. Decrypting all stored data client-side
3. Re-saving everything as plaintext to the database
4. Clearing the `is_encrypted` flag

### User Experience
- The encryption toggle will no longer be permanently disabled once encrypted
- When a user toggles encryption OFF, a confirmation dialog appears warning them:
  - "This will remove encryption from your Secure Vault. All passwords and Legacy Locker data will be stored without encryption. Are you sure?"
- User must enter their master password to confirm
- A loading state shows progress while all entries are being decrypted and re-saved
- On success, the vault returns to its unencrypted state

### Technical Changes

**File: `src/components/SecureVault.tsx`**

1. Remove `disabled={existingEncrypted}` from the Switch component (line 479) so the toggle can be turned off
2. Update `handleEncryptionToggle` to handle the `checked === false` case:
   - Show a confirmation dialog
   - Prompt for master password if not already in session
   - Call a new `handleRemoveEncryption` function
3. Add `handleRemoveEncryption` function that:
   - Fetches all `password_catalog` entries for the user
   - Decrypts each entry's `encrypted_password`, `username`, and `website_url` fields using the session master password
   - Updates each entry in the database with the plaintext values
   - Fetches the `legacy_locker` record and decrypts any encrypted fields
   - Updates the `legacy_locker` record with plaintext values
   - Sets `is_encrypted = false` on the `legacy_locker` record
   - Updates local state (`existingEncrypted`, `isEncrypted`, clears `sessionMasterPassword`)
4. Add a confirmation AlertDialog with a warning message about the security implications

**File: `src/components/PasswordCatalog.tsx`**
- No changes needed -- the component already handles both encrypted and unencrypted modes based on props

### Security Considerations
- The master password is required to decrypt, so only the rightful owner can remove encryption
- A clear warning is shown about the security downgrade
- The operation is atomic per-entry (if it fails mid-way, some entries remain encrypted -- the user can retry)
- An audit log entry should be created when encryption is removed
