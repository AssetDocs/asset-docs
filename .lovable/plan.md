## Goal
Fully remove PWA / service worker behavior so every visit to the live site and Lovable preview loads the latest published code. Add a one-time cleanup so users who already installed the old service worker get unstuck automatically.

## Changes

### 1. `vite.config.ts`
- Remove the `import { VitePWA } from "vite-plugin-pwa"` line.
- Remove the entire `VitePWA({ ... })` plugin block (manifest, workbox, runtimeCaching, navigateFallback, etc.).
- Keep `react()` and `componentTagger()` plugins intact. No other build behavior changes.

### 2. `src/main.tsx`
Replace the current "preview-only" SW unregister logic with an unconditional one-time cleanup that runs on every environment (preview + production):
- Unregister every service worker registration returned by `navigator.serviceWorker.getRegistrations()`.
- Delete every Cache Storage entry returned by `caches.keys()` (clears Workbox `html-cache`, `supabase-cache`, precache, etc.).
- Wrap in try/catch and feature-detect `serviceWorker` / `caches` so it's a no-op in unsupported browsers.
- Run before `createRoot(...).render(...)` but do not block rendering (fire-and-forget promises).

This is safe to leave in indefinitely — once a browser has no SW and no caches, the calls become no-ops. We can remove it in a future cleanup pass.

### 3. `index.html`
- Remove the `<link rel="manifest" href="/manifest.webmanifest" />` tag (the file no longer exists once VitePWA is gone).
- Leave the PWA-style meta tags (`theme-color`, `apple-mobile-web-app-*`, `mobile-web-app-capable`) — they're harmless metadata and don't trigger SW behavior. Optional: remove the "PWA Meta Tags" comment.

### 4. `package.json`
- Remove `"vite-plugin-pwa": "^1.2.0"` from `dependencies`.
- Lockfile (`bun.lock` / `package-lock.json`) updates happen automatically on install.

## What is intentionally NOT changed
- `public/_redirects` — SPA fallback stays as-is. Routing, Supabase auth callbacks (`/~oauth`, `/auth/callback`), Stripe success routes, invite acceptance routes, and dashboard routes are all client-side React Router routes served via `/*  /index.html  200` and are unaffected.
- `src/pages/Install.tsx` — the "Add to Home Screen" instructions page stays. Without a service worker, browsers can still pin the site to the home screen using basic metadata; only true offline support is lost.
- `capacitor.config.ts` — unrelated to web SW.
- No changes to AuthContext, Stripe checkout flows, or invite flows.

## Verification after implementation
1. Hard reload the live site twice — first reload installs the cleanup, second loads fresh code with no SW.
2. DevTools → Application → Service Workers should show "no service workers".
3. DevTools → Application → Cache Storage should be empty (or empty after one navigation).
4. Subsequent publishes should appear immediately on next page load.

## Follow-up (optional, later)
After ~2–4 weeks the cleanup block in `main.tsx` can be deleted, since by then virtually all returning users will have had it run at least once.

## Files touched
- `vite.config.ts` (edit)
- `src/main.tsx` (edit)
- `index.html` (edit — remove manifest link)
- `package.json` (remove dependency)