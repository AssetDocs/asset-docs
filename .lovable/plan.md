

## Update Sample Dashboard to Match Current User Dashboard

### Overview
Synchronize the Sample Dashboard with the current user dashboard layout, add missing collapsible sections, update card data, and implement hover tooltips so visitors can learn about each section without clicking.

---

### Changes

#### 1. Add missing collapsible demo sections between card rows

The real dashboard has four collapsible bars that the sample dashboard lacks. We will add static demo versions of each:

- **Documentation Checklist** -- between the red row (Asset Documentation / Family Archive) and the yellow row (Legacy Locker / Password Catalog). A collapsed bar with a ChevronDown icon; clicking shows a demo alert explaining what it does.
- **MFA Dropdown** -- between the yellow row and the green row. Same collapsed-bar pattern.
- **Asset Values** -- between the green row and the blue Property Profiles card. Collapsed bar matching the real dashboard's DollarSign icon and "Asset Values" label.
- **Emergency Instructions** -- after the blue row (Account Settings / Access & Activity), before the orange utility row. Collapsed bar with a demo alert.

Each will use the standardized collapsible bar styling: `px-6 py-4`, `text-sm font-semibold`, `ChevronDown` icon that rotates -90 degrees when collapsed.

#### 2. Update card content to match current dashboard

- **Insights & Tools tags**: Update from `['Asset Values', 'Manual Entry', 'Upgrades & Repairs', 'Source Websites', 'Paint Codes']` to `['Smart Calendar', 'Asset Values', 'Manual Entry', 'Upgrades & Repairs', 'Source Websites', 'Paint Codes']`
- **Vault badges**: Change from `"Authorized Users Only"` with a `🔒` emoji to `"Encrypted"` with a `LockKeyhole` icon (matching the real dashboard's encrypted state display)

#### 3. Add hover tooltips for descriptions

- Wrap each `DemoGridCard` and `DemoUtilityCard` with a Radix `Tooltip` component
- On hover, display the card's `alertDescription` text in a tooltip
- Keep the existing click-to-alert behavior as well (for mobile users who can't hover)
- The tooltip will appear after a short delay (~300ms) and show a concise version of the description

#### 4. Update banner text

- Change the demo banner instruction from "Click on any tile to learn what it does" to "Hover over or click any tile to learn what it does"

---

### Files to Edit

| File | Action |
|------|--------|
| `src/pages/SampleDashboard.tsx` | Full update: add collapsible bars, update tags/badges, wrap cards with tooltips |

### Technical Notes

- Import `LockKeyhole` from lucide-react (replaces the `🔒` emoji)
- Import `Tooltip`, `TooltipContent`, `TooltipProvider`, `TooltipTrigger` from `@/components/ui/tooltip`
- Import additional icons: `FileCheck`, `ShieldCheck`, `DollarSign` (for collapsible bar icons)
- The collapsible demo bars will be non-functional (just show alerts on click) since the sample dashboard has no real data
- No database or routing changes required
