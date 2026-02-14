

# Dashboard UI Refinements: Asset Values Bar, Subtitle Removal, Arrow Consistency

## Overview

Three changes: extract Asset Values into its own collapsible bar on the dashboard, remove subtitle text from collapsed dropdown bars, and standardize all expand arrows to point downward.

---

## Changes

### 1. DashboardGrid.tsx -- Add "Asset Values" collapsible bar

- Import `AssetValuesSection` and `DollarSign` icon
- Add a new full-width collapsible bar after the Insights & Tools card and Property Profiles card (after the blue row, before the orange utility row)
- Style it identically to the Documentation Checklist and MFA bars: `bg-card border border-border rounded-lg`, with a clickable header containing a `DollarSign` icon in a rounded circle, the title "Asset Values", a `ChevronDown` with rotation animation, and localStorage persistence for open/closed state
- When expanded, render `<AssetValuesSection />` inside the content area
- Add state: `isAssetValuesOpen` with localStorage key `assetValuesDropdownOpen`

### 2. InsightsToolsGrid.tsx -- Remove Asset Values card

- Remove the "Asset Values" `DashboardGridCard` entry (lines 29-38) since it now lives as its own collapsible bar on the main dashboard

### 3. MFADropdown.tsx -- Remove subtitle, fix arrow

- Remove the `<p>` subtitle line ("Secure your account with an authenticator app or backup codes") from the collapsed trigger area
- Move that text inside the expanded content area (above the TOTP/Backup settings)
- Replace the `ChevronUp`/`ChevronDown` toggle with a single `ChevronDown` that uses `transition-transform` and `-rotate-90` when collapsed (matching the Documentation Checklist pattern)

### 4. SecurityProgress.tsx -- Remove subtitle, fix arrows

- **Security Progress section**: Remove the `<p>` subtitle ("Overall account protection status") from the collapsed trigger; move it into the expanded content (above the existing instructions text)
- Replace `ChevronUp`/`ChevronDown` toggle with single `ChevronDown` + rotation animation
- **Documentation Checklist section** (embedded in SecurityProgress): Same treatment -- remove the `<p>` subtitle ("A guided checklist for documenting your home, business, and more") from trigger; move inside expanded content. Replace chevron toggle with single `ChevronDown` + rotation

### 5. Account.tsx -- Update tab routing

- Remove the `asset-values` case from the "Back to Insights & Tools" button group since it is no longer a sub-tab of Insights & Tools
- Keep the `asset-values` TabsContent so the page still renders if navigated to directly, or alternatively redirect to the dashboard

---

## Technical Details

**Arrow pattern (standardized across all dropdowns):**
```tsx
<ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? '' : '-rotate-90'}`} />
```

**Asset Values collapsible bar structure:**
```tsx
<div className="md:col-span-2">
  <div className="w-full bg-card border border-border rounded-lg overflow-hidden">
    <button onClick={handleToggleAssetValues} className="w-full px-6 py-4 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <DollarSign className="h-4 w-4 text-primary" />
        </div>
        <span className="text-sm font-semibold text-foreground">Asset Values</span>
      </div>
      <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isAssetValuesOpen ? '' : '-rotate-90'}`} />
    </button>
    {isAssetValuesOpen && (
      <div className="px-4 pb-4 pt-2 border-t border-border">
        <AssetValuesSection />
      </div>
    )}
  </div>
</div>
```

**Files to modify:**
- `src/components/DashboardGrid.tsx`
- `src/components/InsightsToolsGrid.tsx`
- `src/components/MFADropdown.tsx`
- `src/components/SecurityProgress.tsx`
- `src/pages/Account.tsx`

