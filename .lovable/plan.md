

## Update Sample Dashboard to Mirror Current User Dashboard

The sample dashboard is outdated and shows UI patterns that no longer exist on the real user dashboard. This update will align it 1:1 with the current layout.

### What's Changing

**Remove outdated sections:**
- Remove `DemoAccountHeader` (the 4 stat cards: Total Items, Total Value, Properties, Storage Used) -- these do not appear on the real dashboard overview
- Remove `DemoStorageDashboard` (the collapsible storage usage section) -- not present on the real dashboard overview
- Remove `DemoSecurityProgress` (the card-style milestone list) -- replaced with a compact collapsible bar

**Update Welcome Banner to match real layout:**
- Current sample: just "Welcome, Demo User!" with account number on one line
- Real dashboard: two-line header ("Welcome, [Name]!" subtitle + "Your Asset Safe Dashboard" title), a tagline, and three shortcut buttons (Settings, Properties, Access) on the right
- Update demo banner to match this layout with static demo shortcuts that trigger alerts

**Replace Security Progress with compact collapsible bar:**
- Real dashboard uses a single-line collapsible bar: Shield icon, "Security Progress" label, UserStatusBadge, a flex-1 Progress bar, and a ChevronDown toggle
- When expanded: shows 9 numbered milestone checklist items grouped by phase
- Sample will show a static version of this bar with demo data (e.g., 4/9 completed, 44% progress)

**Grid card layout verification (already matches):**
The grid card order and structure already matches the real dashboard:
1. Asset Documentation (red) + Family Archive (red)
2. Documentation Checklist collapsible bar (full-width)
3. Legacy Locker (yellow) + Password Catalog (yellow)
4. MFA collapsible bar (full-width)
5. Insights & Tools (green) + Property Profiles (blue)
6. Asset Values collapsible bar (full-width)
7. Account Settings (blue) + Access & Activity (blue)
8. Emergency Instructions collapsible bar (full-width)
9. Bottom utility row: Export Assets + Download All + Post Damage Report (3-col orange)

All tooltip descriptions and click alerts remain in place.

**Add missing Quick Notes card:**
The real Insights & Tools grid has a "Quick Notes" card -- verify it's represented in the sample's Insights & Tools tooltip description.

### Technical Details

**File modified:** `src/pages/SampleDashboard.tsx`

Changes:
- Delete `DemoWelcomeBanner` component (lines 53-62) and replace with a new version matching WelcomeBanner layout: two-line header, tagline, account number badge, and 3 static shortcut buttons (Settings, Properties, Access) that trigger `showDemoAlert`
- Delete `DemoAccountHeader` component (lines 65-112) and all references
- Delete `DemoStorageDashboard` component (lines 114-155) and all references, including `storageOpen` state
- Delete `DemoSecurityProgress` component (lines 158-188) and replace with a new `DemoSecurityProgressBar` that renders the compact collapsible bar format: Shield icon + "Security Progress" text + static "User" badge + Progress bar at 44% + ChevronDown toggle. When expanded, shows a static 9-item milestone checklist matching the real component's phases (Getting Started, Next Steps, Advanced)
- Update the render section to remove the deleted sections and use the new components
- Ensure the Insights & Tools tooltip includes "Quick Notes" in its tags/description

No other files are modified. No new dependencies.

