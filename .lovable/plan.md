
## What's Different Between the Two Dropdowns

The button labels are different lengths:
- "🔒 Security & Privacy" — short
- "More ways Asset Safe supports your life" — long

The buttons use `flex items-center gap-1` which means they're inline/auto-width. The visual "size mismatch" is just the text length difference — the containers themselves are structurally identical. To make them feel visually matched, we make both buttons `w-full` with `justify-between` so the chevron is always pinned to the right edge, giving both a consistent full-width appearance regardless of label length.

Also need to darken both gradients from `rgba(42,157,143,0.08)` to something more visible — `rgba(42,157,143,0.18)` is a noticeable but still subtle step up.

## Changes — `src/components/DocumentProtectSection.tsx`

**1. Both `<button>` elements** (lines 76–82 and 119–125):
- Change `className` from `"flex items-center gap-1 text-sm ..."` to `"flex w-full items-center justify-between gap-2 text-sm ..."` so both buttons stretch full width with the chevron right-aligned.

**2. Both gradient `style` props** (lines 74 and 117):
- Change `rgba(42,157,143,0.08)` → `rgba(42,157,143,0.18)` on both wrappers.

That's it — 4 line changes, single file.
