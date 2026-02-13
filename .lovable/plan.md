

## Update Auth Email URLs to getassetsafe.com

### Overview
Update the `send-auth-email` edge function and Supabase config to use the new domain `getassetsafe.com` instead of hardcoded `assetsafe.net`. This ensures all auth-related emails (signup verification, password reset, magic link, invite) generate correct callback URLs.

### Changes

**1. `supabase/functions/send-auth-email/index.ts`**
- Line 84: Change `const appUrl = "https://www.assetsafe.net"` to `const appUrl = "https://www.getassetsafe.com"`
- Line 163 (and lines 233, 293, 349): Update logo image URLs from `https://www.assetsafe.net/lovable-uploads/...` to `https://www.getassetsafe.com/lovable-uploads/...` in all four email templates (verification, reset, magic link, invite)

**2. `supabase/config.toml`**
- Update `site_url` from `"https://lovable.dev"` to `"https://www.getassetsafe.com"`
- Update `additional_redirect_urls` to include `"https://www.getassetsafe.com"` and `"https://getassetsafe.com"`

**3. `supabase/functions/send-verification-email/index.ts`**
- Update logo image URL from `assetsafe.net` to `getassetsafe.com` (line 42)

### Out of Scope (for a follow-up)
There are ~65 files with hardcoded `assetsafe.net` references (SEO canonical URLs, structured data, other edge function email templates like deletion requests, contact form error messages, etc.). These should be updated in a separate pass to avoid a massive change in this focused auth-template update.

### Technical Notes
- The `send-auth-email` function is a Supabase Auth Hook -- it intercepts all auth emails before they are sent
- The `appUrl` variable is used to construct the `/auth/callback?token_hash=...` confirmation URLs in every auth email
- The `site_url` in config.toml is what Supabase Auth passes as `email_data.site_url` to the hook
- The logo images must be accessible at the new domain for them to render in emails

