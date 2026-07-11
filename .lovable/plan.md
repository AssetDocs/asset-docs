## Apply Codex's VIP Contacts fix

Codex pushed commit `76b1939b` with the migration file and edge functions already in the repo. This plan applies them to the live Supabase project.

### Steps

1. **Run migration** `20260709120000_share_vip_contacts_with_account_members.sql` via the migration tool.
   - Replaces old owner-only RLS on `vip_contacts` and `vip_contact_attachments` with policies that allow Owners + Full Access members to insert/update/delete and Read Only members to view.
   - Replaces the `contact-attachments` storage policies with the same account-scoped model (uses first path segment as owner user_id).

2. **Deploy edge functions** `secure-delete-contact` and `secure-delete-file` so they run against the new policies.

3. **Verify** by asking you to retry Add Contact on `/account/contacts` and a contact delete from the affected shared/authorized workspace login.

No frontend code changes are needed — `VIPContacts.tsx` already writes `user_id = effectiveUserId` (the owner), which matches the new policies' `has_account_access(auth.uid(), user_id, 'full_access')` check.
