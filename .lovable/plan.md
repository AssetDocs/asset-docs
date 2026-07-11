Codex has pushed the fix for `vip_contacts` account-scoping. On approval I will:

1. Redeploy `secure-delete-contact` (and `secure-delete-file` if needed) so the edge functions pick up any schema changes.
2. Verify the contacts table policies and grants now allow non-owner members with Full Access to insert/update/delete.
3. Ask you to retry Add Contact on `/account/contacts` and confirm success.

No frontend code changes planned unless the retry still surfaces an error — in which case I'll capture the real Postgres error from the console and iterate.