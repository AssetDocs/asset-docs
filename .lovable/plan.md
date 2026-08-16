# Time-Stamp & Activity-Record Audit

## What I checked

Live production database (`leotcbfpqiekgkgumecn`): every table's timestamp columns, every trigger, the contents of `user_activity_logs`, plus every place the app writes activity records in code.

## Finding 1 — Row timestamps: essentially complete

Every user-content table has `created_at`, and all but three also have `updated_at` maintained automatically by a `BEFORE UPDATE` database trigger (not by the client, so it cannot be skipped or faked from the browser).

Covered with both create + update stamps: properties, items, documents, all folder tables (photo/video/document/memory-safe/notes/legacy-locker), memory safe items, family recipes, medications, important locations, notes, traditions, legacy locker + voice notes, password catalog, financial accounts, financial loans, insurance policies, trust information, VIP contacts + attachments, damage reports, manual damage entries, upgrades/repairs, emergency instructions, quick notes, tax returns, receipts, calendar events, service providers, paint codes, contributors.

Gaps (create stamp only, no modification stamp):
- `property_files`
- `legacy_locker_files`
- `account_memberships`

## Finding 2 — Who made the change is NOT recorded on the row

Content rows carry a `user_id`, but that is the **account owner** the record belongs to — it is not the person who performed the action. There is no `created_by` / `updated_by` on any content table. So for a record touched by an Authorized User, the row itself cannot tell you whether the owner or the AU created or edited it.

## Finding 3 — The activity log exists but covers only a fraction of activity

`user_activity_logs` is well designed: it already has actor, category, action, resource type/name, free-form details, IP address, user agent, and timestamp. But it is only written from a handful of places:

| Recorded today | Not recorded |
|---|---|
| Property create / update / delete | All Family Archive modules (recipes, medications, locations, memory safe, notes, traditions) |
| Inventory item create / edit / delete | Legacy Locker entries, files, voice notes |
| File uploads through the shared upload hook | Digital Access / password catalog entries |
| Vault access, encryption removal | Financial accounts, loans, insurance, trust info |
| MFA enable/disable, backup codes | VIP contacts, calendar events, emergency instructions |
| Authorized-user invite / cancel / accept / remove | Document + photo + video deletions, all folder create/rename/delete |

Production data confirms this: only 15 distinct action types have ever been logged.

## Finding 4 — Authorized-User activity lands in the wrong log

The shared logging helper stamps both the owner field and the actor field with the currently signed-in user. When an Authorized User works inside someone else's account, the entry is filed under the AU's own history instead of the account being modified. The owner therefore cannot see AU activity, and the account has no consolidated record.

## Finding 5 — Deletions largely leave no trace

Only property and inventory-item deletions are logged. Every other delete path removes the row outright with no tombstone and no log entry, so after a deletion there is no record that the item ever existed or who removed it. Database-level audit triggers writing to `audit_logs` exist on only three tables: `contributors`, `user_roles`, `gift_subscriptions`.

## Summary

Timestamps: in place and reliable. Attribution and deletion evidence: the significant gaps.

---

## Options moving forward

### Option A — Database-level audit triggers (recommended)
Attach a generic audit trigger to every user-content table that writes an insert/update/delete record (table, row id, actor from the session, account scope, changed fields, timestamp) into a single audit table.

- Captures **everything**, including deletions, and including writes made by edge functions or direct SQL — nothing can bypass it.
- One migration; no per-module code changes; no UI change.
- Cost: audit volume grows; needs the retention sweep already documented in the retention runbook.

### Option B — Extend the app-side activity log
Add logging calls to every module that currently lacks them, and fix the owner/actor scoping so AU actions file under the account being modified.

- Produces user-readable entries that fit the existing Access & Activity screens.
- Cost: many touch points; anything not routed through the app (edge functions, admin SQL) is still invisible.

### Option C — Add `created_by` / `updated_by` columns
Stamp the acting user directly on each content row via trigger.

- Cheapest way to answer "who last touched this record" at a glance.
- Does not record history — only the latest actor — and still says nothing about deletions.

### Recommended sequence
1. Close the three missing `updated_at` gaps (Finding 1).
2. Option A for complete, tamper-resistant coverage including deletions.
3. Fix the AU owner/actor scoping bug (Finding 4) so the existing Access & Activity views become accurate.
4. Option C afterward if you want at-a-glance attribution in the UI.
5. Optionally surface a subset in the existing activity screens later — no display work is required for the record itself to exist.

## Technical notes

- New audit writes would target the existing `audit_logs` / `user_activity_logs` structures rather than a new table, so existing retention sweepers and admin views keep working.
- Audit tables stay append-only with admin-scoped read policies, matching the audit-log retention runbook.
- Retention windows already documented (7 years admin audit, 2 years user activity) would apply unchanged.
