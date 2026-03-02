
# Add Expandable "More Ways" List to "What You Get" Box

## What's changing

A collapsible section will be added at the bottom of the "What You Get" box. It will show a "More ways Asset Safe supports your life ↓" toggle link, and when clicked, reveal a secondary list of 9 items in a visually lighter style (smaller text, muted color, subtle left-border or dot indicators).

The two boxes ("How It Works" and "What You Get") are currently in a CSS grid with `items-start`. To keep them visually balanced at the same height regardless of the expanded state, the grid will use `items-stretch` and each card will be `h-full`, so both cards always fill the same row height. The expandable content grows inside the right card only.

## Technical details

**File: `src/components/DocumentProtectSection.tsx`**

1. Add a new `useState` for `moreOpen` (default `false`).
2. At the bottom of the "What You Get" card, add:
   - A `<button>` styled as a subtle text link: `"More ways Asset Safe supports your life ↓"` — small, muted-foreground color, with chevron rotation on open.
   - A collapsible `<div>` using `max-h-0 / max-h-96 + overflow-hidden + transition-all` (same pattern already used in this file for the Security dropdown).
   - Inside: a `<ul>` with 9 list items, each with a small bullet or dash, `text-sm text-muted-foreground`, slightly lighter than the top 3 features.
3. Change the grid wrapper from `items-start` (implicit) to `items-stretch` and add `flex flex-col` + `h-full` to each card so both boxes maintain the same height.

## Items in the expanded list
- Guided documentation checklists
- Room-by-room inventory tools
- Insurance & claim-ready exports
- Emergency instructions
- Password & digital access catalog
- Family archive (memories, notes, history)
- Property profiles (homes, rentals, vacation properties)
- Secure sharing with authorized users
- Post-damage documentation tools

## No other files need to change
