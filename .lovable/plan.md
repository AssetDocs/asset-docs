## Pre-Launch Review Plan

Run the full battery of automated checks Lovable can perform against the current codebase and backend, then compile a prioritized findings report. No code changes in this pass — just discovery.

### Scans to run

1. **Security scan** (`security--run_security_scan`)
   - RLS coverage on every public table (esp. newly added `family_important_locations`, `entitlements`, `user_roles`, `restore_drill_runs`).
   - Public-schema GRANTs.
   - Edge function auth/service-role protection.
   - Exposed data / misconfigurations.

2. **Supabase linter** (`supabase--linter`)
   - Function search_path, security definer misuse, index gaps, unused indexes.

3. **SEO review** (`seo_chat--trigger_scan` + `list_findings`)
   - Title/meta/OG for public pages (Index, Pricing, About, Blog, Legal, Terms, Contact, Partnership pages).
   - Canonicals, sitemap, robots, structured data.

4. **Dependency scan** (`code--dependency_scan`)
   - Vulnerable npm packages before launch.

5. **Codebase spot checks** (parallel reads, no edits)
   - `index.html` head metadata (title/description/OG) — verify not the Lovable defaults.
   - `public/robots.txt` and `public/sitemap.xml` freshness.
   - `.env` / hardcoded secrets audit (grep only).
   - Error boundaries + 404/500 pages.
   - Console errors / network 4xx on preview (`read_console_logs`, `read_network_requests`).
   - Accessibility spot check on primary CTAs / icon-only buttons.
   - Stripe/webhook secret configuration presence via `secrets--fetch_secrets` (names only).

6. **Cron / operational health** (read-only SQL from launch runbook)
   - `cron_job_health_status` for lifecycle jobs.
   - Unresolved `stripe_events` with `outcome='error'`.
   - Open `checkout_fulfillments` in `manual_review`.

### Deliverable

A single findings report grouped by severity (P0 blocker / P1 pre-launch / P2 post-launch), each item with: what, where, why it matters, suggested fix. You then pick which to implement — I won't change code in this pass.

### Out of scope for this pass

- Legal/counsel decisions, Stripe dashboard settings, PITR screenshots, secret-manager choice — those are operator evidence items already tracked in `docs/AssetSafe_Launch_Evidence_Collection_Runbook.md`.

Approve to run the scans.
