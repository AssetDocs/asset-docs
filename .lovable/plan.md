# Supabase Production Migration Capability Check

Investigation only. No database changes, no migration application, no edits to SQL files or policies.

## A. Production Supabase connection status

**Connected.** `supabase/config.toml` links this project to the external Supabase project:

- `project_id = "leotcbfpqiekgkgumecn"`
- This matches the connected production project referenced in project context.

## B. Can Lovable apply production migrations?

**Yes, via the `supabase--migration` tool.** This is the primary/only migration mechanism exposed to Lovable for this project.

What Lovable **cannot** do from this sandbox:

- The Supabase CLI (`supabase db push`) is **not installed** in the sandbox (`which supabase` returns nothing).
- Direct `psql` access is unavailable (`PG*` env vars are not set).

Therefore, if the `supabase--migration` tool cannot handle external projects, then **no automated migration path exists from this environment** and the migration would need to be applied manually through the Supabase Dashboard SQL Editor or a local Supabase CLI run by someone with the project credentials.

## C. How migrations are deployed

Based on the tool description:

- `supabase--migration` creates/applies migrations against the project's database.
- It creates migration files asynchronously and surfaces them for user approval before execution.
- It is **not tied to publish/deploy** — it is a separate database-change approval flow.
- It applies only the migration submitted in the call; it does not automatically scan `supabase/migrations/` and apply all unapplied files like `supabase db push` does.
- After approval and execution, Supabase types are regenerated automatically.

To apply the existing `20260905000100_narrow_admin_docs_storage_policies.sql`, the SQL would need to be passed to `supabase--migration` as a new migration query (Lovable's tool writes the migration file and applies it). It cannot simply "run the file already in the repo" as a deployment step.

## D. Is migration `20260905000100` pending?

**Yes.** Confirmed by:

- The file exists in `main`: `supabase/migrations/20260905000100_narrow_admin_docs_storage_policies.sql`
- The user verified in the live Supabase SQL Editor that `version = '20260905000100'` is **not present** in `supabase_migrations.schema_migrations`.
- The live storage policies for `admin-docs` still allow `dev_lead`, which the migration would remove.

## E. Exact safe next step

Two options:

1. **Lovable-managed path (preferred if the tool supports external projects):**
   - Switch to build mode.
   - Call `supabase--migration` with the exact SQL from `20260905000100_narrow_admin_docs_storage_policies.sql`.
   - Approve the migration when prompted.
   - Verify in Supabase SQL Editor that `schema_migrations` now contains `20260905000100` and the four `admin-docs` policies restrict access to `owner`/`admin` only.

2. **Manual path (if Lovable's migration tool is restricted or unavailable for this external project):**
   - Copy the SQL from `supabase/migrations/20260905000100_narrow_admin_docs_storage_policies.sql`.
   - Paste it into the production Supabase SQL Editor and run it.
   - Verify the same way as above.

Because the Supabase CLI is not present in the sandbox, there is no third "local CLI push" option from here.

## F. Confirmation that no database changes were made

Confirmed. This check only:
- read `supabase/config.toml`,
- listed the migration file,
- checked for the Supabase CLI,
- checked for `PG*` environment variables,
- inspected the git history/merge state.

No `supabase--migration`, `supabase--run_sql`, `psql`, policy edit, or file modification was performed.

---

Capability check complete. No migration was applied.
