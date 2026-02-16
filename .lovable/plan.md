

## Restore Collapsible MFA on Dashboard

The recent change to flatten the security tab in Account Settings removed the collapsible wrapper from `MFADropdown.tsx`, which is shared between two locations:

1. **Dashboard** (`DashboardGrid.tsx`) -- should be collapsible (currently broken)
2. **Account Settings Security tab** (`AccountSettings.tsx`) -- should be flat (working correctly)

### Solution

**Option A (cleanest):** Add a prop to `MFADropdown` to control whether it renders as collapsible or flat.

- **`src/components/MFADropdown.tsx`**: Add `collapsible?: boolean` prop (default `true`). When `true`, wrap the content in a `Collapsible` from Radix with a clickable header that toggles open/closed. When `false`, render flat as it does now.
- **`src/pages/AccountSettings.tsx`**: Pass `collapsible={false}` to `<MFADropdown />` in the security tab.
- **`src/components/DashboardGrid.tsx`**: No change needed -- it will use the default `collapsible={true}`.

### Technical Detail

In `MFADropdown.tsx`:
- Import `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent` from `@/components/ui/collapsible`
- Add `ChevronDown` icon for the toggle indicator
- Add `isOpen` state (default `false`)
- When `collapsible` is `true`: wrap the header in `CollapsibleTrigger` and the TOTP/Backup settings in `CollapsibleContent`
- When `collapsible` is `false`: render everything directly as it does today

This is a two-file change (`MFADropdown.tsx` and `AccountSettings.tsx`) that restores the dashboard behavior without affecting the Account Settings security tab.

