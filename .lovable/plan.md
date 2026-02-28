
## UI Text Changes — Financial Accounts Section in PasswordCatalog.tsx

**File:** `src/components/PasswordCatalog.tsx`

**All changes are text/label edits only — no logic or data changes.**

---

### Change 1 — Section heading (line 709)
**From:** `Financial Accounts`
**To:** `Financial Accounts Reference` with a subtitle beneath it:
`A secure reference to important financial accounts and where to find full details.`

The `<h4>` at line 707–710 becomes a `<div>` with heading + subtitle paragraph to match the pattern used elsewhere in the vault.

---

### Change 2 — Remove "Account Number" input field (lines 749–760)
Remove the entire `<div className="space-y-2">` block containing the `accountNumber` Label and Input. The grid wrapping it (line 749) also becomes unnecessary — if Routing Number is the only remaining field in the grid it can remain as a single full-width field or the grid wrapper can be removed.

---

### Change 3 — Remove "Routing Number" input field (lines 761–770)
Remove the entire `<div className="space-y-2">` block containing the `routingNumber` Label and Input, along with the enclosing grid `<div>` if it only held these two fields.

---

### Change 4 — Remove "Current Balance" input field (lines 772–782)
Remove the entire `<div className="space-y-2">` block containing the `currentBalance` Label and Input.

---

### Change 5 — Update "Notes" helper text (lines 783–791)
**From placeholder:** `"Will be encrypted..."`
**To placeholder:** `"Instructions, contact details, or where to find full statements"`

---

### Change 6 — Remove displayed "Account Number" in saved cards (lines 834–838)
Remove the `<div className="space-y-1">` block that shows the decrypted account number label and `<code>` value.

---

### Change 7 — Remove displayed "Routing Number" in saved cards (lines 839–844)
Remove the conditional block `{account.routing_number && (...)}` that renders the routing number label and value.

---

### Change 8 — Remove displayed "Current Balance" in saved cards (lines 846–851)
Remove the conditional block `{account.current_balance !== null && (...)}` that renders the balance label and formatted dollar value.

---

### Change 9 — Remove surrounding grid wrapper (lines 834)
After removing account number and routing number display blocks, the `<div className="grid grid-cols-1 md:grid-cols-2 gap-3">` wrapper at line 834 will be empty. Remove it entirely.

---

**No state, no data model, no API, no database changes required.** The `accountNumber`, `routingNumber`, and `currentBalance` fields in `accountFormData` state can remain for now (they are simply unused inputs) — or their state entries can be cleaned up in the same pass. The saved card display simply no longer renders those three fields.
