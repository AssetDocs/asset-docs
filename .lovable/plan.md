
Fix Digital Access save/load by aligning `PasswordCatalog` with the actual Secure Vault encryption state.

What I found
- This does not primarily look like an RLS issue. The `password_catalog` table already has SELECT/INSERT/UPDATE/DELETE policies scoped to `auth.uid() = user_id`.
- The main bug is a frontend state mismatch:
  - In `src/components/SecureVault.tsx`, the child is rendered as usable when the vault is unencrypted: `isUnlockedFromParent={!isEncrypted || isUnlocked}`.
  - In `src/components/PasswordCatalog.tsx`, both loading and saving still require `sessionMasterPassword`.
  - So in unencrypted mode, the form appears available, but:
    - the fetch effect never loads “Saved Entries”
    - `handleSubmit` / `handleEditSave` / `handleAccountSubmit` can return early
    - this creates a silent no-op experience
- There is also a second save bug still present:
  - create was fixed to use `website_url: ''`
  - edit still uses `website_url: editData.websiteUrl.trim() || null`
  - that can still violate the table’s `website_url NOT NULL` rule on update

Plan
1. Fix the parent/child contract
- Pass vault encryption state from `SecureVault` into `PasswordCatalog` explicitly.
- Make `PasswordCatalog` branch on “encrypted vs unencrypted” instead of only “do I have a master password”.

2. Fix Saved Entries loading
- In unencrypted mode: fetch entries immediately and show stored values as-is.
- In encrypted mode: keep the current decrypt-on-load behavior with the master password.
- Add a real loading cycle so the UI does not look empty while data is being fetched.

3. Fix create/edit save behavior
- In unencrypted mode: allow saves without a master password and store values consistently with the current “encryption removed” flow.
- In encrypted mode: continue encrypting before insert/update.
- Replace silent early returns with visible error toasts so blocked saves are obvious.
- Apply the blank-URL fallback everywhere, including edit/update.

4. Audit the other vault form in the same component
- The Financial Accounts Reference form currently validates fields that are not shown in the UI.
- I’ll align that form so it is actually submittable while I’m in the same file.

5. Verify end-to-end
- Test Digital Access in both states:
  - unencrypted vault: create, refresh, edit, delete
  - encrypted vault: unlock, create, refresh, edit, delete
  - remove encryption and confirm entries still load correctly
- Confirm the saved row count in Supabase matches the “Saved Entries” list.

Files likely involved
- `src/components/SecureVault.tsx`
- `src/components/PasswordCatalog.tsx`

Technical details
- Evidence in code:
  - `PasswordCatalog` load effect only runs when `sessionMasterPassword` exists
  - `handleSubmit`, `handleEditSave`, and `handleAccountSubmit` require `sessionMasterPassword`
  - `SecureVault` treats unencrypted state as unlocked, but does not provide a master password in that state
- Secondary bug to patch:
  - update path still writes `null` to `website_url` when blank
