## Goal

Clean up the "How It Works" and "What You Get" cards in `src/components/DocumentProtectSection.tsx` so descriptions fit on a single line and the expandable footers ("🔒 Security & Privacy" and "More ways Asset Safe supports your life") have more vertical breathing room.

## Changes (single file: `src/components/DocumentProtectSection.tsx`)

1. **Widen the two-column grid**
   - Current: `max-w-5xl` (1024px) wrapping the `grid grid-cols-1 lg:grid-cols-2`.
   - Change to `max-w-7xl` (1280px) so each card is wider and long descriptions like:
     - "Access verified records whenever insurance, legal, or estate needs arise."
     - "Time-stamped, secure records you can trust"
     - "Encrypted storage for life's most important details and instructions."
     fit on a single line at `lg:` breakpoint and above.
   - Keep the existing `gap-8` between columns.

2. **Add vertical breathing room above the expandable footer sections**
   - Both cards have a footer block with `mt-auto -mx-6 -mb-6 px-6 pb-6 pt-4 border-t`.
   - Increase the top padding from `pt-4` to `pt-8` so the "🔒 Security & Privacy" toggle and the "More ways Asset Safe supports your life" toggle sit further down from the steps/features list above them.
   - Also add `mt-8` (or `mt-10`) before the `mt-auto` block to guarantee extra space even when content is short — keep `mt-auto` so it still sticks to the bottom when the column is taller.

3. **No content/text changes** — only layout/spacing adjustments. Both cards remain visually balanced (`items-stretch` already in place).

## Out of scope

- No font, color, or copy edits.
- No changes to the mobile (single-column) layout — wider `max-w-7xl` only affects `lg:` and up; mobile still stacks full-width within the container.

## Files touched

- `src/components/DocumentProtectSection.tsx` (one file, ~3 small edits)
