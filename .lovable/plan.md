# Secure Vault Dashboard Simplification

UI/navigation only. No changes to encryption, passphrase flow, RLS, permissions, data, or vault logic.

## 1. Dashboard: one Secure Vault destination

In `src/components/DashboardGrid.tsx`, inside the existing pale-yellow (amber) Secure Vault container:

- Remove the two `DashboardGridCard`s (Legacy Locker, Digital Access).
- Keep the amber wrapper and its `ENCRYPTED / NOT ENCRYPTED` badge (existing `useVaultEncryptionStatus` logic unchanged).
- Add one full-width card:
  - Title: Secure Vault
  - Description: "Your most private information, protected in one encrypted space."
  - Secondary descriptor line: "Legacy Locker · Digital Access"
  - CTA: "Open Secure Vault"
- CTA opens the existing vault tab (`/account?tab=legacy-locker`) via the current `rememberAndOpen` helper, so resume-activity tracking keeps working.

Resulting upper hierarchy: Asset Documentation | Knowledge Hub, then full-width Secure Vault, then the existing rows (Documentation Checklist, MFA, Asset Values, Emergency Instructions, export/download/report).

## 2. Landing page title audit

In `src/pages/Account.tsx`, the vault tab headers currently read "Legacy Locker" and "Digital Access" as parent page titles. Change both vault tab entries in `getSectionConfig()` to:

- Title: Secure Vault
- Subtitle: "Legacy Locker · Digital Access — your encrypted space."

Legacy Locker and Digital Access remain the internal collapsible sections rendered by `SecureVault` (unchanged component and internal navigation). The `password-catalog` tab keeps working for existing deep links; only its heading presentation changes.

## 3. Legacy Instructions collapsed by default

`AccountContinuityInstructions` (rendered above `SecureVault` on the vault tab) currently renders fully expanded. Wrap its existing card body in a collapsible section:

- Header row stays visible and clearly labeled ("Legacy Instructions") with a chevron toggle.
- Default state: collapsed on page load; user can expand.
- Fields, save behavior, Legacy Admin references, request counts, and permissions untouched — presentation state only.

## Verification

- Only one Secure Vault destination on the dashboard, full width, amber/encrypted treatment intact.
- "Open Secure Vault" lands on the existing Secure Vault experience with both Legacy Locker and Digital Access sections available.
- Legacy Instructions renders collapsed and expands on click; saving still works.
- Typecheck (`bunx tsgo`) and production build pass.
