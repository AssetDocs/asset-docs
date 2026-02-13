

## Reposition Dashboard Dropdown Modules

### Overview
Move the Documentation Checklist and MFA dropdown from the top-of-dashboard stack into contextually relevant positions within the DashboardGrid, keeping only Security Progress as the global top-level widget.

### Current Layout (Overview Tab)
```text
WelcomeBanner
SecurityProgress (contains Security Progress + Documentation Checklist)
MFADropdown
AdminContributorPlanInfo
DashboardGrid
  Row 1 (Red): Asset Documentation | Family Archive
  Row 2 (Yellow): Legacy Locker | Password Catalog
  Row 3 (Green): Insights & Tools
  Row 4 (Blue): Property Profiles | Account Settings | Access & Activity
  Bottom: Export | Download | Post Damage
```

### New Layout
```text
WelcomeBanner
SecurityProgress (Security Progress ONLY - no checklist)
AdminContributorPlanInfo
DashboardGrid
  Row 1 (Red): Asset Documentation | Family Archive
  --- Documentation Checklist (full-width, collapsed) ---
  Row 2 (Yellow): Legacy Locker | Password Catalog
  --- MFA Dropdown (full-width, collapsed) ---
  Row 3 (Green): Insights & Tools
  Row 4 (Blue): Property Profiles | Account Settings | Access & Activity
  Bottom: Export | Download | Post Damage
```

### Changes

**1. `src/components/SecurityProgress.tsx`**
- Add an optional prop `hideChecklist?: boolean` (default `false`)
- When `hideChecklist` is `true`, skip rendering the Documentation Checklist section (the second collapsible button and its content)
- This preserves backward compatibility for any other usage of the component

**2. `src/pages/Account.tsx`**
- Pass `hideChecklist` to SecurityProgress on the overview tab
- Remove the standalone `<MFADropdown />` from the overview top stack (line 148-150)

**3. `src/components/DashboardGrid.tsx`**
- Import `DocumentationChecklist` and `MFADropdown`
- Insert `<DocumentationChecklist embedded />` as a full-width row between the Red row (Asset Documentation + Family Archive) and the Yellow row (Legacy Locker + Password Catalog)
- Insert `<MFADropdown />` as a full-width row between the Yellow row and the Green row (Insights and Tools)
- Both remain collapsed by default (existing behavior)

### Files to Modify
- `src/components/SecurityProgress.tsx` -- add `hideChecklist` prop
- `src/pages/Account.tsx` -- remove MFADropdown from top stack, pass `hideChecklist` to SecurityProgress
- `src/components/DashboardGrid.tsx` -- insert DocumentationChecklist and MFADropdown between grid rows

### What Does NOT Change
- Internal functionality of any module
- Collapsed-by-default behavior
- No duplication of modules
- SecurityProgress stays at top as global status

