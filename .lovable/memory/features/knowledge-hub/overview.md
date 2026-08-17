---
name: Knowledge Hub
description: Knowledge Hub merges Family Archive + Insights & Tools; wrapper screens, canonical tab routing, retired Quick Notes
type: feature
---

# Knowledge Hub

Replaces the former **Family Archive** and **Insights & Tools** dashboard cards with one
`Knowledge Hub` card (`/account?tab=knowledge-hub`).

## Structure
10 top-level destinations in `KnowledgeHubGrid`: Contacts, Medication List, Notes,
Family Traditions & Recipes, Memory Safe, Important Locations, Paint Codes,
Upgrades & Repairs, Source Websites, Smart Calendar.

13 underlying modules reachable in at most two clicks via three **wrapper screens**:
- `contacts` -> VIP Contacts, Trusted Professionals
- `notes-hub` -> Written Notes, Voice Notes
- `traditions-recipes` -> Family Traditions, Family Recipes

**Wrapper rule (non-negotiable):** wrapper screens render navigation choices only.
They never fetch or mutate module data and never change active-account/workspace context.

## Routing
`src/lib/knowledgeHubNavigation.ts` is the single canonical routing layer:
- `normalizeAccountTab` maps legacy `life-hub` and `insights-tools` -> `knowledge-hub`,
  and retired `quick-notes` -> `notes`.
- `getAccountTabParent` drives every contextual "Back to …" button in `Account.tsx`.
- Tab changes use pushes (not replace-state) so browser Back retraces the UI path.

Do not add ad-hoc tab redirects in components — extend this map instead.

## Other placement rules
- Manual Entry Items live under **Asset Documentation** (`manual_entry` asset type ->
  `/inventory`), not Knowledge Hub.
- Dashboard Quick Add has two root categories: Asset Documentation and Knowledge Hub.
- Quick Notes is retired; its single record was migrated into `notes_traditions` with
  `migrated_from_user_note_id` as the deterministic idempotency marker.
- Public marketing/legal copy still says "Family Archive" / "Insights & Tools" by design;
  the rename was scoped to the authenticated dashboard.
