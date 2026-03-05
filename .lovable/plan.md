
## What We're Changing

Two things in `DocumentProtectSection.tsx`:

1. **Move the Security & Privacy green bar** — from below both boxes (standalone row) into the bottom of the "How It Works" box, styled like the "More ways Asset Safe supports your life" dropdown inside "What You Get".

2. **Add a green gradient separator** to both dropdown toggles (Security & Privacy in "How It Works", and More Ways in "What You Get") so they visually separate from the box content above.

---

## Current Layout

```text
[ How It Works box ]   [ What You Get box          ]
                        └─ "More ways..." dropdown

[ Security & Privacy green bar ] ← full-width below both boxes
```

## New Layout

```text
[ How It Works box                ]   [ What You Get box          ]
 └─ "Security & Privacy" dropdown      └─ "More ways..." dropdown
    (same style as "More ways")           (both get green gradient)
```

---

## File to Change: `src/components/DocumentProtectSection.tsx`

### Change 1 — Remove standalone Security block
Remove lines 117–143 (the standalone `<div className="max-w-5xl mx-auto mt-8">` Security Info Dropdown block that sits below both grid boxes).

### Change 2 — Add Security dropdown inside "How It Works" box
At the bottom of the "How It Works" box (after the `steps.map` block, before the closing `</div>`), add a separator + Security & Privacy toggle that matches the "More ways" pattern:

```tsx
{/* Security & Privacy expandable — matches "More ways" style */}
<div className="mt-5 pt-4 border-t border-border" style={{ background: 'linear-gradient(to bottom, transparent, rgba(42,157,143,0.06))' }}>
  <button
    onClick={() => setSecurityOpen(!securityOpen)}
    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
  >
    <span>🔒 Security & Privacy</span>
    <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", securityOpen && "rotate-180")} />
  </button>
  <div className={cn(
    "overflow-hidden transition-all duration-300 ease-in-out",
    securityOpen ? "max-h-96 opacity-100 mt-3" : "max-h-0 opacity-0"
  )}>
    <p className="text-sm text-muted-foreground text-center mb-3">
      Built for: Homeowners • Renters • Families • Property owners • Small businesses
    </p>
    <SecurityBadges variant="compact" />
  </div>
</div>
```

### Change 3 — Add green gradient to both dropdown areas
Both the "More ways" section and the new "Security & Privacy" section get a subtle green gradient background on their wrapper `div` to create a visual separation from the card content above.

The gradient is applied on the `mt-5 pt-4 border-t border-border` wrapper div:
```tsx
className="mt-5 pt-4 border-t border-border rounded-b-lg px-0 -mx-0"
style={{ background: 'linear-gradient(to bottom, transparent, rgba(42,157,143,0.07))' }}
```

Since the card has `p-6` padding, we extend the gradient to bleed to the card edges using negative margins + matching padding so it looks seamless:
```tsx
className="mt-5 -mx-6 -mb-6 px-6 pb-6 pt-4 border-t border-border rounded-b-lg"
style={{ background: 'linear-gradient(to bottom, transparent, rgba(42,157,143,0.08))' }}
```

---

## Summary of edits

| What | Where | Action |
|---|---|---|
| Remove standalone Security bar | Lines 117–143 | Delete |
| Add Security dropdown to "How It Works" box | After `steps.map`, before box closing `</div>` | Add |
| Green gradient on "More ways" section | "What You Get" box dropdown wrapper | Add inline style |
| Green gradient on new Security section | "How It Works" box dropdown wrapper | Add inline style |

Single file change: `src/components/DocumentProtectSection.tsx`
