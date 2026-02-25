

## Fix Mobile CTA Centering

**File:** `src/components/MobileCTA.tsx`

Update the component to fix the off-center positioning and text alignment:

- On the outer fixed container: ensure `max-w-full overflow-hidden` to prevent any horizontal overflow
- On the Button/Link: change from `w-full block` to `w-full flex items-center justify-center` so the text is properly centered within the button

No other files or dependencies affected.

