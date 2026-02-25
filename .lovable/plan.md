

## Fix Text Overflow on Mobile

**File:** `src/components/DocumentProtectSection.tsx` (line 117)

Remove `whitespace-nowrap` from the `<p>` tag so the text naturally wraps to two lines on smaller screens. Optionally add `max-w-md` or `max-w-lg` to keep it nicely contained and centered.

**Change:** Replace `whitespace-nowrap` with `text-center` (it may already be centered by parent, but this ensures it). The text will naturally break across two lines on mobile.

