## Goal
Add more breathing room between the last bullet in each box ("Access verified records..." and "Grant secure access...") and the horizontal divider line above the "🔒 Security & Privacy" / "More ways Asset Safe supports your life" toggles.

## Change
File: `src/components/DocumentProtectSection.tsx`

On both expandable footer wrappers (the two `<div>`s with `className="mt-auto -mx-6 -mb-6 px-6 pb-6 pt-8 border-t border-border rounded-b-lg"`), add a top margin so the border-top sits further below the content list.

Update class from:
```
mt-auto -mx-6 -mb-6 px-6 pb-6 pt-8 border-t border-border rounded-b-lg
```
to:
```
mt-10 -mx-6 -mb-6 px-6 pb-6 pt-8 border-t border-border rounded-b-lg
```

Replacing `mt-auto` with `mt-10` (40px) gives a guaranteed gap above the divider on both cards. Because both cards use the same value and the grid uses `items-stretch`, the cards will continue to align in height. The `pt-8` inside the footer keeps the toggle button itself spaced below the divider (already addressed in the prior change).

If after review the cards no longer match heights perfectly due to differing content lengths, we can switch to `mt-10 lg:mt-auto lg:pt-16` to restore stretch behavior while keeping the visual gap — but the simpler `mt-10` is the first step.

## Files Changed
- `src/components/DocumentProtectSection.tsx` (two class updates)
