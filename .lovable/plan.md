

## Add "Life Support" Dropdown to Features Page (Homeowners Tab)

Add a new `FeatureCategory` titled **"Life Support"** to the Homeowners tab, positioned directly after the existing "Property & Assets" (Core Platform Features) dropdown.

### Content Structure

The dropdown will contain two subsections, each with a header and a grid of feature cards:

**1. Family Archive** -- "Everyday life, organized and protected."
Six cards in a 3-column grid:
- **VIP Contacts** (Contact icon) -- "Your most important contacts with priority levels."
- **Voice Notes** (Mic icon) -- "Record and store voice memos for your records."
- **Trusted Professionals** (Briefcase icon) -- "Track your trusted service providers and contractors."
- **Notes & Traditions** (BookOpen icon) -- "Capture family traditions, stories, and important notes."
- **Family Recipes** (ChefHat icon) -- "Preserve cherished family recipes for generations."
- **Memory Safe** (Archive icon) -- "A protected place for the memories you want to keep -- and pass on."

**2. Insights & Tools** -- "Manage repairs and organize property details."
Six cards in a 3-column grid:
- **Smart Calendar** (CalendarDays icon) -- "Reminders, records, and timelines -- all in one place."
- **Manual Entry Items** (Package icon) -- "Add items manually with descriptions and values."
- **Upgrades & Repairs** (Hammer icon) -- "Document property improvements and repair history."
- **Source Websites** (Globe icon) -- "Save product sources and reference links."
- **Paint Codes** (Palette icon) -- "Store paint colors, brands, and finish details."
- **Quick Notes** (StickyNote icon) -- "Jot down quick reminders or thoughts."

### Technical Details

**File modified:** `src/pages/Features.tsx`

- Add new icon imports: `Contact, Mic, BookOpen, ChefHat, CalendarDays, Package, StickyNote` from `lucide-react` (Briefcase, Globe, Palette, Hammer, Archive already imported)
- Insert a new `FeatureCategory` block titled "Life Support" between the "Property & Assets" category (line 120) and the "Protection & Insurance" category (line 122)
- Inside the category, render two labeled subsections with subtitle text and 3-column grids of `FeatureCard` components
- No new components, dependencies, or files needed
