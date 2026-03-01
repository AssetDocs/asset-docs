
## Fix: Duplicate "Terms of Service" Link in Pricing Consent Checkbox

### Problem

On the Pricing page, the consent checkbox reads:

> "I agree to the Terms of Service and Terms of Service."

Both links point to `/terms`. The second link should be **Privacy Policy** linking to `/legal`.

### Change Required

**File**: `src/pages/Pricing.tsx`, lines 261–263

Current:
```
<a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary underline">
  Terms of Service
</a>.
```

Replace with:
```
<a href="/legal" target="_blank" rel="noopener noreferrer" className="text-primary underline">
  Privacy Policy
</a>.
```

### Result

The consent checkbox will read:

> "I agree to the **Terms of Service** and **Privacy Policy**."

- Terms of Service → `https://getassetsafe.com/terms`
- Privacy Policy → `https://getassetsafe.com/legal`

This is a single-line text and href change in one file.
