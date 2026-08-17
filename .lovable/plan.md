# Knowledge Hub — Dashboard and Navigation Simplification

Combine Family Archive and Insights & Tools into one top-level section called Knowledge Hub. This is a navigation and presentation reorganization. Existing modules keep their own tables, forms, permissions, and business logic.

## The new Knowledge Hub

One flat, grouped screen with **10 top-level destinations** (Contacts, Medication List, Notes, Family Traditions & Recipes, Memory Safe, Important Locations, Paint Codes, Upgrades & Repairs, Source Websites, Smart Calendar). Wrapper screens only where modules are genuinely the same kind of thing.

```text
Knowledge Hub
  People & Care
    Contacts ........... wrapper -> VIP Contacts | Trusted Professionals
    Medication List .... direct
  Notes & Family
    Notes .............. wrapper -> Written Notes | Voice Notes
    Family Traditions & Recipes ... wrapper -> Traditions | Recipes
    Memory Safe ........ direct
  Property & Household
    Important Locations .. direct
    Paint Codes .......... direct
    Upgrades & Repairs ... direct
    Source Websites ...... direct
  Planning
    Smart Calendar ....... direct
```

Wrappers are navigation only. Each one is a small screen of cards that link to the existing modules — no shared storage, no merged forms, no combined CRUD.

**Wrapper rule (non-negotiable):** a wrapper screen preserves the current active-account/workspace context and does **not** fetch or mutate module data itself. It renders navigation choices and passes control to the existing module destination. Wrappers must not grow their own queries, counts, lists, or write actions.

The 10 top-level destinations resolve to **13 underlying modules** through the three wrappers: VIP Contacts, Trusted Professionals, Medication List, Written Notes, Voice Notes, Traditions, Recipes, Memory Safe, Important Locations, Paint Codes, Upgrades & Repairs, Source Websites, Smart Calendar.

## Dashboard changes

The Family Archive and Insights & Tools cards are replaced by a single card:

- **Knowledge Hub** — "Contacts · Notes · Property Details · Records · Memories"

Everything else on the dashboard stays where it is: Asset Documentation, the Secure Vault banner, Legacy Locker, Digital Access, MFA, Asset Values, Emergency Instructions, the export/download row, and Post Damage Report.

The Smart Calendar "due today" badge currently shown on the Insights & Tools card moves onto the Knowledge Hub card so nothing time-sensitive becomes less visible.

## Quick Add changes

The chooser drops from three categories to two: **Asset Documentation** and **Knowledge Hub**. The Knowledge Hub step lists the same create shortcuts that exist today, regrouped to match the new structure.

Two adjustments inside it:

- **Quick Note** stays as a shortcut, but now opens the standard Notes add form.
- **Manual Entry Item** moves under Asset Documentation, since it is another way to document an asset.

Every shortcut keeps working the way it does now: `add=1` only asks an existing screen to open its own create UI. It never bypasses permissions and never performs the write itself.

## Quick Notes retirement (the one real data change)

Quick Notes and Notes are two separate systems today, not one feature with two views. Quick Notes writes to `user_notes`; Notes writes to `notes_traditions`. There is **1** Quick Notes record in the database, belonging to **1** account.

Approach:

1. **Pre-migration count check.** Confirm the source count is exactly 1 and record the row's `user_id`, title, file reference, and timestamps before anything moves.
2. **One-time, guarded migration** of that record into the main Notes system, preserving title, content, attachment reference, and original timestamps where technically supported.
3. **The migration must be idempotent.** It only inserts rows that have no matching Notes record already, so re-running it can never create duplicates. Re-running is a no-op.
4. **Post-migration verification:** migrated target count = 1; `user_id` matches the source; file reference matches the source; timestamps preserved; source count unchanged; no duplicate Notes rows created. Any mismatch stops the rollout.
5. Verify the migrated note renders correctly in Notes, including its attachment, in the app.
6. Remove Quick Notes from navigation and stop all new writes to it.
7. Keep "Quick Note" only as a Quick Add shortcut into the standard Notes add form.
8. **Do not drop the `user_notes` table** in this update. Schema removal is a later cleanup once the migration is confirmed, so rollback stays easy.

The attachment file itself is not moved — it already lives in the `documents` bucket and the migrated record keeps pointing at the same path. No storage policy changes.

## Naming scope

Rename in the live dashboard and in the customer-facing demo surfaces (Sample Dashboard, Video Help). Hold pricing and Terms copy for a separate deliberate marketing and legal review, so this update does not quietly alter legal text.

## Out of scope

No changes to Auth, MFA, Authorized Users, gifts, billing, RLS, storage policies, retention/deletion, the audit trail, or any unrelated backend system. No module is merged or rewritten because it is being grouped differently.

## Technical notes

**Files touched (UI/routing):**
- `src/components/DashboardGrid.tsx` — replace the two cards with the Knowledge Hub card; move the calendar badge.
- `src/components/LifeHubGrid.tsx` + `src/components/InsightsToolsGrid.tsx` — replaced by a single `KnowledgeHubGrid.tsx` with the four group headings.
- New wrapper components: `ContactsHub`, `NotesHub`, `TraditionsRecipesHub`.
- `src/components/DashboardQuickAdd.tsx` — two root categories; regrouped option list; `Step` type becomes `'root' | 'knowledge-hub'`.
- `src/pages/Account.tsx` — add `knowledge-hub` plus the three wrapper tabs to the tab set and `getSectionConfig`; retarget the contextual back buttons ("Back to Family Archive" / "Back to Insights & Tools" become "Back to Knowledge Hub", or to the relevant wrapper).
- `src/lib/assetUploadRouting.ts` — add the Manual Entry destination so Asset Documentation and Quick Add cannot drift.
- `src/components/AssetDocumentationGrid.tsx` — surface Manual Entry Items.

**Legacy links must not break.** These already exist in the wild and in stored data:
- `?tab=life-hub` and `?tab=insights-tools` — bookmarks, and `dashboardResume.familyArchive` values already persisted as `destination_route` in `dashboard_resume_activities` rows. Both tab keys will resolve to the Knowledge Hub rather than dead-ending.
- `src/lib/dashboardResume.ts` — `familyArchive` route key updated, old rows still resolve.
- `src/pages/Inventory.tsx` — `parentRoute` currently points at `?tab=insights-tools`; retarget to Asset Documentation.
- `src/pages/VIPContacts.tsx` — "back to Family Archive" retargets to the Contacts wrapper.

**Quick Notes migration mapping** (`user_notes` -> `notes_traditions`): `user_id`, `content`, `title` (fallback title where null, since the target requires one), `file_name`, `file_path`, `bucket_name`, `created_at`, `updated_at` preserved; `record_type` set to `'note'`; `folder_id` left null so it lands in the unfiled view. Run as a data migration, not a schema migration. The write is captured in `content_audit_events` automatically.

**Read-only and Authorized User behavior** is inherited unchanged — wrappers render existing modules, and Quick Add still hides itself when the active account cannot edit.

## Verification

- Knowledge Hub reachable from the dashboard; all eleven modules reachable in at most two clicks.
- Old `?tab=life-hub` and `?tab=insights-tools` links land somewhere sensible.
- Back navigation from every module returns to the right parent.
- Every Quick Add shortcut opens the correct create UI, including Quick Note -> Notes and Manual Entry -> Asset Documentation.
- The migrated Quick Note is visible in Notes with its attachment intact.
- Smart Calendar badge still appears when items are due today.
- Read-only Authorized User sees the same structure without create actions.
