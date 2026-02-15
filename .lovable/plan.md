
## Security Progress Header Layout Update

### Current Layout
The header has two rows:
1. Row 1: "Security Progress" title + User Status Badge
2. Row 2: Progress bar (full width below)

### New Layout
Everything on a single horizontal line:

```text
[Shield Icon] [Progress Bar] [Security Progress] [Badge]    [Chevron]
```

### Technical Changes

**File: `src/components/SecurityProgress.tsx`** (lines 129-138)

Replace the two-row layout inside the header button with a single-row flex layout:
- Remove the wrapping `div` with `flex-1 min-w-0` that creates vertical stacking
- Place the `Progress` bar (with a fixed or flex width) directly after the shield icon
- Follow it with the title text and badge
- All items use `items-center` on the same flex row, eliminating the `mb-1` spacing

The progress bar will get a constrained width (around `w-20` or `w-24`) so it fits neatly inline without dominating the row.
