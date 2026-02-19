
## Emergency Instructions — Dashboard Collapsible Module

### Overview

This feature adds a full-width collapsible "🛟 Emergency Instructions" dropdown to the dashboard, placed between the Account Settings / Access & Activity cards and the orange utility row. When expanded, users can fill out structured emergency guidance across 6 sections. All data persists to Supabase via a new `emergency_instructions` table.

---

### What Will Be Built

**1. Database Migration**

A new table `emergency_instructions` with a single JSONB row per user, storing all form data. This allows flexible structure without a complex multi-table schema. RLS policies will ensure only the owner can read/write their own record.

```text
Table: emergency_instructions
─────────────────────────────────────────────
id              uuid (PK)
user_id         uuid (FK → auth.users, unique)
created_at      timestamptz
updated_at      timestamptz
primary_contact jsonb      ← Section 1 primary contact
secondary_contact jsonb    ← Section 1 secondary contact
first_actions   jsonb      ← Section 2 what to do first
access_notes    jsonb      ← Section 3 access & info notes
property_assets jsonb      ← Section 4 property & asset priorities
professionals   jsonb[]    ← Section 5 trusted professionals list
family_notes    text       ← Section 6 notes for family
```

**2. New Component: `EmergencyInstructions.tsx`**

A self-contained component matching the exact collapsible bar pattern used by `MFADropdown` and the Asset Values bar. It uses `Collapsible` + `CollapsibleContent` from Radix UI.

**Collapsed state:** Shows the 🛟 icon, "Emergency Instructions" label, and a ChevronDown (rotated -90° when closed), matching all other dashboard bars exactly.

**Expanded state:** Full form laid out in 6 labeled sections, each separated visually. Designed to be as compact as possible while remaining scannable.

Structure inside the expanded content:
```text
┌─────────────────────────────────────────────────────┐
│ 🔔 Access Notice (conditional — if no contributors) │
│    "Authorized User Required" banner + CTA button   │
└─────────────────────────────────────────────────────┘

SECTION 1 — Immediate Contacts
  Primary:   Name | Relationship | Phone | Email | [Notify First toggle]
  Secondary: Name | Relationship | Phone | Email

SECTION 2 — What To Do First
  3 textarea fields (first action / most important / do not do)

SECTION 3 — Access & Information Notes
  3 text fields (insurance location / documents / password notes)

SECTION 4 — Property & Asset Priorities
  3 textarea fields (focus on / document before moving / do not discard)

SECTION 5 — Trusted Professionals
  Repeatable group (default entries: Insurance Agent, Restoration, Plumber,
  Electrician, Attorney, Executor, Financial Advisor)
  Each entry: Name | Role | Phone | Email | Notes
  + Add Another / Remove buttons

SECTION 6 — Notes for Family
  Single large textarea

─────────────────────────────────────
Footer status message (based on fill state)
[Save Emergency Instructions] primary button
```

**3. Contributor Check (Access Notice Banner)**

The component will query the `contributors` table to see if any contributors exist for the user's account. If `contributors.length === 0`, it shows the amber warning banner:

> **Authorized User Required**
> Emergency Instructions are designed to help trusted people act on your behalf...
> `[Add Authorized User →]` (navigates to `access-activity` tab)

The banner is passed an `onNavigate` prop from `DashboardGrid` so the tab switch works correctly.

**4. Save/Load Pattern**

- On mount: fetch from `emergency_instructions` where `user_id = auth.user.id`
- On save: upsert the full record (single button at bottom of expanded content)
- Autosave is not used to keep the UX intentional and avoid partial saves
- A toast confirms save success/failure

**5. Placement in `DashboardGrid.tsx`**

Added as a `md:col-span-2` full-width block, positioned **after** the Account Settings + Access & Activity cards (mirroring how MFA sits after Legacy Locker / Password Catalog):

```text
[Asset Documentation] [Family Archive]
[Documentation Checklist ─────────────]
[Legacy Locker]        [Password Catalog]
[MFA Dropdown ────────────────────────]
[Insights & Tools]     [Property Profiles]
[Asset Values ────────────────────────]
[Account Settings]     [Access & Activity]
[Emergency Instructions ──────────────]   ← NEW
[Export] [Download All] [Post Damage]
```

**6. `Account.tsx` — Tab Registration**

Add `emergency-instructions` to the `getSectionConfig()` map and add a `<TabsContent value="emergency-instructions">` that renders the `EmergencyInstructions` component in a standalone full-page view (with Back to Dashboard button already handled by the existing navigation logic).

---

### Technical Details

- **Component file:** `src/components/EmergencyInstructions.tsx`
- **Migration file:** `supabase/migrations/[timestamp]_emergency_instructions.sql`
- **Pattern match:** Exact same `Collapsible` + chevron + `px-6 py-4` styling as `MFADropdown`
- **RLS:** `USING (auth.uid() = user_id)` for SELECT/INSERT/UPDATE/DELETE
- **Professionals list:** Stored as a JSONB array; default pre-populated entries with empty name/phone fields so the form isn't blank on first open
- **Conditional banner:** Queries `contributors` table on mount; shows banner if result is empty
- **No new route needed:** Rendered inline in dashboard via the collapsible and also as a tab (`emergency-instructions`) for potential future deep-link use
- **Back to Dashboard button:** Already handled globally in `Account.tsx` for all non-overview tabs

---

### Files to Create / Modify

| File | Action |
|------|--------|
| `src/components/EmergencyInstructions.tsx` | Create — full component |
| `src/components/DashboardGrid.tsx` | Edit — add collapsible bar after Access & Activity row |
| `src/pages/Account.tsx` | Edit — register `emergency-instructions` tab + config |
| `src/integrations/supabase/types.ts` | Edit — add `emergency_instructions` table types |
| `supabase/migrations/[ts]_emergency_instructions.sql` | Create — table + RLS |
