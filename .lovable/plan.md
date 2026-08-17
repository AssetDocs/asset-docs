# Global "+ Add" — Align Quick Add With Knowledge Hub

Quick Add becomes a two-choice shortcut that mirrors the new dashboard: **Asset Documentation** or **Knowledge Hub**. It only finds the right existing form faster — no new forms, no writes, no permission decisions.

## Current state (verified)

Part of this work already landed with the Knowledge Hub consolidation:

- Quick Add root already shows exactly two categories: Asset Documentation and Knowledge Hub. Family Archive and Insights & Tools are gone.
- Asset Documentation still routes through `AssetTypeSelector` + `assetUploadRouting.ts`, and `manual_entry` is already a selectable type routing to the existing Manual Entry screen (`/inventory`) from one shared definition.
- Knowledge Hub Quick Add is a single flat list of 12 shortcuts using `?add=1`.

What remains is presentation and routing polish described below.

## 1. Group the Knowledge Hub list

Replace the flat list with four subtle section labels (small uppercase muted text, not buttons, not an extra step). Every action stays one click from this screen.

```text
PEOPLE & CARE          NOTES & FAMILY        PROPERTY & HOUSEHOLD    PLANNING
  VIP Contact            Quick Note            Important Location      Calendar Entry
  Trusted Professional   Voice Note            Paint Code
  Medication             Family Tradition      Upgrade / Repair
                         Family Recipe         Source Website
                         Memory
```

Modal design is unchanged (icon, title, short description, chevron, Back, close X). The header and Back stay fixed; only the choices area scrolls.

## 2. Labels and copy

| Action | Copy |
| --- | --- |
| VIP Contact | Add an important personal contact. |
| Trusted Professional | Add a trusted service provider or professional. |
| Medication | Add to the medication reference list. |
| Quick Note (renamed from "Note") | Jot down a reminder, instruction, or thought. |
| Voice Note | Record a voice memo. |
| Family Tradition | Preserve a family tradition or story. |
| Family Recipe | Preserve a favorite family recipe. |
| Memory | Add a memory to Memory Safe. |
| Important Location | Record where something important is stored. |
| Paint Code | Save a paint color, brand, room, and finish. |
| Upgrade / Repair | Document a property improvement or repair. |
| Source Website | Save a useful product, supplier, or reference link. |
| Calendar Entry | Create a reminder or calendar event. |

Root copy: Asset Documentation — "Photos, videos, documents, receipts, records, and assets." Knowledge Hub — "Contacts, notes, household information, reminders, and family records."

"Quick Note" is a convenience label only. It opens the standard Written Note form in the Notes module; records land in the normal Notes system, never `user_notes`. The old table is not dropped.

## 3. Inclusion decisions (based on what each module actually supports)

- **Source Website — include.** The module has a real "Add Website" toggle, so `add=1` can open it. This needs a small addition to that section so it responds to the flag.
- **Memory — include.** Memory Safe already has a dedicated create route, so the shortcut simply navigates there.
- **Voice Note — include, no auto-open.** Recording requires a user gesture for microphone access, so the shortcut lands on the Voice Notes screen with the recorder ready and does not auto-start.
- **Paint Code — include, no auto-open.** Its add form is already visible on the page, so no flag is needed.

## 4. Guardrails (unchanged behavior to preserve)

- Quick Add is hidden for read-only users via the existing account context; it never decides ownership, account, workspace, permission, entitlement, or Authorized User rights.
- Navigation stays within the active workspace — no account switching.
- `add=1` is only a request that the destination open its existing create UI. Destinations consume it and strip only that parameter with replace navigation, preserving other query values.
- No write happens until the destination form is submitted.

## Technical notes

- `src/components/DashboardQuickAdd.tsx`: restructure `knowledgeHubOptions` into grouped sections (`{ heading, options[] }`), rename "Note" to "Quick Note", update descriptions, add the Source Website entry, keep a single option-row renderer. Make the dialog body scroll while the header/Back remain fixed.
- `src/components/SourceWebsitesSection.tsx`: read `add=1` from the URL, open the existing add form once, then strip only `add` with `replace: true`. Same pattern already used in `VIPContacts.tsx` and other modules — no CRUD or query changes.
- `src/lib/assetUploadRouting.ts` remains the single Manual Entry routing definition shared by Asset Documentation and Quick Add. No change needed.
- No schema, RLS, storage, auth, billing, or destination-form changes.

## Verification

- Root shows exactly two categories; no Family Archive or Insights & Tools wording anywhere in Quick Add.
- Asset Documentation choices all still work; Manual Entry Item opens the same workflow reached from the Asset Documentation page.
- Each Knowledge Hub shortcut lands on the correct existing destination, auto-opens its add UI where supported, and stays in the active workspace.
- Quick Note opens the standard Notes add form and saves to the Notes system, not `user_notes`.
- Read-only users see no Quick Add button.
- Note: authenticated end-to-end checks can't be automated for this project's external Supabase setup, so the account-scoped items need one manual click-through.
