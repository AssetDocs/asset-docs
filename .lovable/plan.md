
## Dashboard Updates: Secure Vault Banner + Label Changes

### Changes Required

All changes are in a single file: `src/components/DashboardGrid.tsx`

---

### 1. Rename "Password Catalog" card title to "Digital Access"
Line 147: `title="Password Catalog"` → `title="Digital Access"`

### 2. Update CTA labels
- Line 137: `actionLabel="Manage Legacy"` → `actionLabel="Open Legacy Locker"`
- Line 150: `actionLabel="Open Catalog"` → `actionLabel="Open Digital Access"`

### 3. Wrap both cards in a Secure Vault banner section

Replace the two separate `DashboardGridCard` entries (lines 132–156) with a grouped layout: a full-width banner above the two cards, then the cards side by side below it.

The banner will span the full 2-column width (using `md:col-span-2`) and display:
- 🔒 **Secure Vault** (bold title)
- "Your most sensitive information — protected with advanced encryption." (subtext)
- Yellow/amber styling to match the existing card color theme

The two cards remain in the same row beneath the banner, visually grouped by proximity and background.

### Visual Structure

```text
┌─────────────────────────────────────────────────────────┐
│  🔒 Secure Vault                                        │
│  Your most sensitive information — protected with       │
│  advanced encryption.                                   │
└─────────────────────────────────────────────────────────┘
┌──────────────────────┐  ┌──────────────────────────────┐
│  Legacy Locker       │  │  Digital Access              │
│  [Open Legacy Locker]│  │  [Open Digital Access]       │
└──────────────────────┘  └──────────────────────────────┘
```

The banner uses `md:col-span-2`, amber/yellow background (`bg-amber-50 border border-amber-200`), rounded corners, and the lock emoji inline with the title text.

### Technical Details

- No new components needed — purely layout/text changes in `DashboardGrid.tsx`
- The existing `vaultBadge` and `vaultBadgeIcon` props on both cards remain unchanged
- The MFA dropdown below the cards is unaffected
- Tags on the Digital Access card will be updated from `['Websites', 'Passwords', 'Sensitive Data']` to `['Websites', 'Logins', 'Sensitive Data']` to drop the word "Passwords" since we're renaming the section (optional — can keep as-is if preferred)
