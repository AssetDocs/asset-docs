
# Password Catalog → "Digital Access" Repositioning

## Overview

This is a focused copy, UX, and category update across three files. No database changes, no encryption changes, no logic changes. The goal is to reposition the section from a generic password locker into a purpose-built tool for everyday digital accounts, with calm guidance (not warnings) steering users toward the Legacy Locker for financial institutions.

---

## Files Being Changed

1. `src/components/PasswordCatalog.tsx` — Primary rename, subtitle, category dropdown, helper guidance, cross-reference link, footer note
2. `src/components/SecureVault.tsx` — Update all references from "Password Catalog" to "Digital Access" in labels, descriptions, and toast messages
3. `src/pages/Account.tsx` — Update the tab title/subtitle config for the `password-catalog` route
4. `src/components/FAQAccordion.tsx` — Add one new FAQ entry for "What types of passwords should I store here?"

---

## Detailed Changes

### File 1 — `src/components/PasswordCatalog.tsx`

**A. Rename section headings and locked-state text**

All occurrences of "Password and Accounts Catalog" and "Password Catalog" in UI text become "Digital Access":

- Line 504: `Password and Accounts Catalog (Locked)` → `Digital Access (Locked)`
- Line 508: `...protected with end-to-end encryption` stays — this is accurate and should remain
- Line 513: `Password and Accounts Catalog Locked` → `Digital Access Locked`
- Line 519: Button: `Unlock Password and Accounts Catalog` → `Unlock Digital Access`
- Line 826: `Password and Accounts Catalog (Unlocked)` → `Digital Access (Unlocked)`
- Line 829: CardDescription: update to the new subtitle text

**B. Add section subtitle to the "Add New Website Password" form header area**

In the controlled-by-parent mode (line 539–540) and standalone mode (line 834–837), immediately before the "Add New Website Password" form, add the new subtitle block:

```
Store access details for everyday digital accounts.
Best for websites, subscriptions, utilities, and personal services.
```

And beneath that, a small cross-reference note (not a warning):

```
For banks and investment accounts, we recommend documenting the institution and next steps in the Legacy Locker instead of storing passwords.
[→ Open Legacy Locker]  (link, styled as a quiet text link)
```

**C. Add "Account Type" dropdown to the password entry form**

In both the controlled-by-parent form (lines 539–601) and the standalone form (lines 834–896), add an optional "Account Type" dropdown as the **first** field (or between Website Name and URL):

Categories:
- Website / Subscription *(default)*
- Subscriptions & Streaming
- Utilities & Home Services
- Personal Services & Memberships
- Other Digital Accounts
- Financial Institution

Implementation approach: add a `Select` component from the existing `@/components/ui/select` (already in the project). Add `accountType` to the `formData` state (separate from financial account state — this is purely display-side). No schema change needed since the existing `password_catalog` table doesn't have this field — it will be a UI-only filter/guidance field OR stored in the `notes` field prefix. Since `password_catalog` does not have an `account_type` column, the cleanest approach is to add the state for the dropdown and, when "Financial Institution" is selected, show the inline guidance text beneath the dropdown. The value does not need to be persisted to the database — its only job is to trigger the conditional helper text. This avoids any migration.

When "Financial Institution" is selected, show below the dropdown (as calm body text, not an alert):

```
Financial institutions typically require in-person or documented verification. 
Passwords are often unnecessary or invalid after death.
```

**D. Update Notes placeholder for password form**

Line 593 and line 884–888: change placeholder from `"Any additional notes..."` to something more specific like `"Security questions, hints, or anything helpful"`

**E. Add footer reinforcement text below the Save button in both forms**

After the Save button in both form variants, add a small `<p>` in muted text:

```
Designed for everyday digital access — not regulated financial systems.
```

**F. Rename form header "Add New Website Password" → "Add New Digital Account"**

- Line 540: `Add New Website Password` → `Add New Digital Account`
- Line 835: same
- Line 597 / 892: Button text `Save Password` → `Save Entry` (or keep `Encrypt & Save`)
- Line 604/900: `Saved Passwords (N)` → `Saved Entries (N)`

---

### File 2 — `src/components/SecureVault.tsx`

All user-visible text references to "Password Catalog" update to "Digital Access":

- Line 228 toast: `"Your Password Catalog and Legacy Locker are now protected..."` → `"Your Digital Access and Legacy Locker are now protected..."`
- Line 523 CardDescription: `Password Catalog & Legacy Locker - Protected with End-to-End Encryption` → `Digital Access & Legacy Locker - Protected with End-to-End Encryption`
- Line 535: `"...access to the Password Catalog and Legacy Locker for all administrators."` → `"...access to Digital Access and Legacy Locker for all administrators."`
- Line 570: same pattern
- Line 580: `"Your Password Catalog and Legacy Locker are encrypted..."` → `"Your Digital Access and Legacy Locker are encrypted..."`
- Line 617: `Password Catalog & Legacy Locker — Your Most Sensitive Information` → `Digital Access & Legacy Locker — Your Most Sensitive Information`
- Line 644: `"Your Password Catalog and Legacy Locker are protected with the same master password."` → `"Your Digital Access and Legacy Locker are protected with the same master password."`
- Line 725: `Password Catalog` (section heading inside the collapsible) → `Digital Access`

---

### File 3 — `src/pages/Account.tsx`

Line 110: Update the tab config entry:

```tsx
'password-catalog': { 
  title: 'Digital Access', 
  subtitle: 'Encrypted storage for everyday online accounts.' 
},
```

---

### File 4 — `src/components/FAQAccordion.tsx`

Add one new FAQ entry to the "Security & Privacy" section (or create a new "Secure Vault" subsection — placing it in Security & Privacy is the simplest option). Insert after the existing MFA accordion items, before the Trust & Estate section:

```
Q: What types of passwords should I store in Digital Access?
A: Use Digital Access for everyday online accounts like subscriptions, streaming services, 
   utilities, and personal services. For banks and investment accounts, we recommend 
   documenting the institution and next steps in the Legacy Locker instead of storing 
   login credentials. Digital Access is designed for accounts that are easy to transfer 
   or close — not regulated financial systems.
```

---

## What Is NOT Changing

- Encryption logic — untouched
- Database schema — no migration needed (account_type is UI-only state)
- Financial Accounts Reference section — already updated in the previous session
- Route key `password-catalog` — unchanged (routing and database identifiers stay)
- Any existing saved entries — no data migration
- The `handleSubmit`, `fetchPasswords`, and all save/delete handlers — logic unchanged
