
## Two changes to SecurityProgress.tsx

### Change 1 — Fix "next step" prompt target status label

**Current behavior (line 119):**
```tsx
Next step to reach {statusLabel === 'Verified' ? 'Verified+' : 'Verified'} status:
```

This is already correct when `statusLabel === 'Verified'` (shows "Verified+"), but there's a subtle issue: `nextTask` is only null when `status?.is_verified_plus` is true. So when the user is plain `'Verified'`, the prompt correctly says "Verified+". When the user is `'User'`, it correctly says "Verified". No bug here — but the user wants to confirm this is working. The logic is correct as-is.

**However**, the `nextTask` selection needs to be smarter when status is `'Verified'`. A verified user only needs MFA for Verified+. So the `nextTask` should skip to the MFA task specifically when `statusLabel === 'Verified'`, rather than just showing the first incomplete task (which might be "Add an Authorized User" — not required for Verified+).

**Fix:** When `statusLabel === 'Verified'`, show the MFA task specifically as the next step if not completed, since that's the only thing needed for Verified+. The general "first incomplete task" logic only applies for `'User'` → `'Verified'` progression.

```tsx
const nextTask = (() => {
  if (status?.is_verified_plus) return null;
  if (status?.is_verified) {
    // Only MFA needed for Verified+
    return allTasks.find(t => t.label === 'Enable Multi-Factor Authentication' && !t.completed) ?? null;
  }
  // For regular users, show first incomplete task
  return allTasks.find(t => !t.completed) ?? null;
})();
```

### Change 2 — Subcategory grouping inside the expanded dropdown

Replace the flat `allTasks.map()` list with three named groups. Each group has a small bold label header, then the tasks beneath it.

**Groups:**
| Group label | Tasks (phase) |
|---|---|
| Getting Started | Complete profile, Create first property, Upload first photos |
| Security Protection | Add authorized user, Enable MFA, Upload important documents |
| Legacy Protection | Enable Secure Vault, Add Legacy Locker details, Assign recovery delegate |

**Implementation:** Define a `groups` array instead of flat `allTasks.map()`. Each group has a `label` and `tasks[]`. Render a section header `<p>` for each group with `text-[10px] font-semibold uppercase tracking-wide text-muted-foreground` styling, followed by its tasks.

Also update the phase labels in `getPhaseLabel` to match the new names:
- Phase 1 → "Getting Started"
- Phase 2 → "Security Protection"  
- Phase 3 → "Legacy Protection"

(The `getPhaseLabel` function is currently used in the flat list inline badge — it will be replaced by the group header approach so that function can be removed or kept for reference.)

Also shorten the task label for "Assign a Recovery Delegate (inside the Secure Vault)" → "Assign a Recovery Delegate" for cleanliness in the list (the subcategory "Legacy Protection" provides enough context).

### Single file change

Only `src/components/SecurityProgress.tsx` needs to be edited.
