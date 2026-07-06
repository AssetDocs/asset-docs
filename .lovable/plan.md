## Diagnosis

The delete failure on `/account/media` comes from the `secure-delete-file` edge function returning `claim_failed`. Its logs show:

```
secure-delete-file: claim failed {
  resource: "property_file",
  id: "…",
  err: "column property_files.pending_delete does not exist"
}
```

### What's actually happening

`secure-delete-file` claims the row atomically by updating these columns on `public.property_files`:
`pending_delete`, `pending_delete_at`, `delete_processing_at`, `delete_attempts`, `delete_error`.

I checked the live database — **all five columns exist** on `public.property_files` with correct types and defaults. So the DB schema is not the problem.

The error is coming from **PostgREST's schema cache**, which the edge function talks to via `supabase-js`. PostgREST snapshots the table shape at boot and only refreshes on `NOTIFY pgrst, 'reload schema'` (or a restart). The recoverable-delete columns were added by a recent migration, but the PostgREST instance the edge function is hitting is still holding the pre-migration shape of `property_files`, so any write that references `pending_delete` (or its siblings) is rejected as "column does not exist" — even though the column is really there.

The four log lines all fire within the same second and reference different `property_file` ids — consistent with cache staleness, not per-row data corruption.

### Why it's only surfacing now

The `pending_delete` / lease columns are new. Older code paths that just did a plain `DELETE FROM property_files WHERE id = …` never referenced these columns and worked fine. The new `secure-delete-file` orchestration is the first caller that writes to them, so it's the first to trip the stale cache.

### Not the cause

- Not RLS — the error is `column … does not exist`, not `permission denied` / `violates row-level security`.
- Not the storage object — the claim step fails **before** any storage removal is attempted.
- Not the frontend — `MediaManagement` / `usePropertyFiles` are calling the right function with the right payload.
- Not related to the recent security migration Codex ran (assistance / realtime / audit logs) — different tables.

## Proposed fix (for your review, not applied)

1. Force a PostgREST schema reload so the edge function sees the new columns:
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```
   I actually already sent this as part of investigation. It typically clears within seconds. If the next delete attempt from the UI succeeds, we're done — no code change needed.

2. If the reload alone doesn't clear it (some Supabase pooled PostgREST workers can be slow to pick it up), the belt-and-braces option is a no-op migration that touches `public.property_files` (e.g. `COMMENT ON COLUMN public.property_files.pending_delete IS 'Recoverable delete lease flag';`). Any DDL on the table forces PostgREST to invalidate its cache for that relation.

3. No application code changes to `secure-delete-file`, `usePropertyFiles`, `MediaManagement`, or RLS policies are needed — they are all correct against the current schema.

## What I'd like you to confirm before I implement

- OK to (a) rely on the `NOTIFY pgrst, 'reload schema'` I already sent and have you retry the delete once, then (b) only if it still fails, ship the no-op `COMMENT ON COLUMN` migration as a cache-buster?
- Or would you prefer I go straight to the migration cache-buster now without a retry?