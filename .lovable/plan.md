
## Four Changes Across Two Files

### 1. SampleDashboard.tsx — MFA callout text (line 378)
Change `"Enable and manage two-factor authentication (TOTP)"` to `"Enable and manage multi-factor authentication (TOTP)"`.

### 2. SampleDashboard.tsx — Remove "Asset Safe Says" alert titles/subtitles
The `showDemoAlert` function (line 40) uses `alert(\`Asset Safe says\n\n${title}\n\n${description}\`)`. This produces the "Asset Safe says" title (browser native dialog title) and "Asset Safe Says" subtitle (the `title` param). The fix: change the alert call to only show the description — skip the title param from the message body, so it becomes just `alert(description)`.

All `DemoGridCard`, `DemoCollapsibleBar`, and `DemoUtilityCard` components receive `alertTitle` and `alertDescription` props and pass them to `showDemoAlert`. We'll update `showDemoAlert` to only show the description.

### 3. SampleDashboard.tsx — Download All Files description (line 457)
Change `"Great for creating local backups or transferring to another storage service."` to `"Download for use alongside your insurance claim forms and as a personal backup."`

### 4. Gift.tsx — Replace old pricing tables with the Pricing page "As a Gift" tables

The current `Gift.tsx` uses an older `giftPlans` array with minimal features and the old `SubscriptionPlan` layout without the "Basic Protection" / "Most Popular" labels.

Replace the `Gift Plans Section` with the same structure from `Pricing.tsx`'s "As a Gift" tab (lines 454–466), including:
- Wrapping each plan card in a `relative div` with the **"Basic Protection"** badge (for Standard) and **"Most Popular for Families and Businesses"** badge with star icon (for Premium) — exactly matching `Pricing.tsx` lines 273–291
- Using the same `giftPlans` feature lists from `Pricing.tsx` (lines 169–194): `["Unlimited properties", "25GB secure cloud storage", "Password Catalog + Secure Vault", "Recipient opts in to renew monthly or yearly"]` for Standard and similarly for Premium
- Same `buttonText="Gift This Plan"` with orange styling and `onClick={() => handleGiftPurchase(plan.planType)}`
- Import `Star` from `lucide-react` (already imported in `Gift.tsx`)

**Technical details for Gift.tsx:**
- Update `giftPlans` array features to match `Pricing.tsx`
- Replace the `flex justify-center gap-8` plan container with a proper `grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto`
- Wrap each plan in a `relative` div with badge overlays (same JSX as Pricing.tsx lines 273–291)
- The badge for standard: `<span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">Basic Protection</span>`
- The badge for premium: `<span className="bg-amber-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 whitespace-nowrap"><Star className="h-3 w-3" /> Most Popular for Families and Businesses</span>`

No new dependencies or files needed.
