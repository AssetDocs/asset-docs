# Why your published changes aren't showing

## Root cause

Your project is configured as a **PWA (Progressive Web App)** in `vite.config.ts` using `vite-plugin-pwa`. Specifically:

- `registerType: 'autoUpdate'`
- A Workbox service worker is generated and registered on every visitor's browser
- It pre-caches **all JS, CSS, HTML, images, fonts** (`globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,svg,woff,woff2}']`)
- A separate `NetworkFirst` cache is also set up for Supabase calls

What this means in practice:

1. The first time anyone visits your site, the service worker installs and caches the entire app.
2. After you publish/update, the **server has the new files**, but returning visitors' browsers serve the **old cached files** from the service worker.
3. The new service worker downloads in the background, but the user typically has to **close all tabs of the site and reopen** (or do a hard refresh + clear) before the update actually shows.
4. This is why "Publish/Update" looks like it did nothing — the deployment succeeded, the cache is just intercepting it.

You can confirm this yourself right now: open the live site in an **incognito/private window** (no service worker yet) — you will almost certainly see the latest changes there, while your normal browser still shows the old version.

## Fix — two parts

### 1. Make updates take effect immediately for returning visitors

Update `vite.config.ts` so the service worker:
- Skips waiting and claims clients on activation (so a new SW takes over immediately instead of waiting for all tabs to close).
- Uses `cleanupOutdatedCaches: true` to drop stale precache entries.
- Switches HTML/navigation requests to `NetworkFirst` so the entry document always tries the network first and only falls back to cache when offline. This ensures users always get the latest `index.html`, which references the latest hashed JS/CSS bundles.

Conceptually:

```text
VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    cleanupOutdatedCaches: true,
    skipWaiting: true,
    clientsClaim: true,
    navigateFallback: '/index.html',
    runtimeCaching: [
      { urlPattern: ({request}) => request.mode === 'navigate',
        handler: 'NetworkFirst', options: { cacheName: 'html-cache' } },
      ...existing supabase rule
    ],
  },
})
```

### 2. One-time recovery for users already stuck on the old version

Add a tiny SW-update prompt (or silent auto-reload) using `virtual:pwa-register` so that as soon as the new service worker is detected, the page reloads automatically. This ensures the next visit after publishing actually shows the new build, even for users who already have the old SW installed.

Conceptually, in `src/main.tsx`:

```text
import { registerSW } from 'virtual:pwa-register';
registerSW({ immediate: true, onNeedRefresh() { window.location.reload(); } });
```

## What to check before/after the fix

- **Verify it's the cache, not the deploy**: open `https://www.getassetsafe.com` in an incognito window. If the latest changes appear there, this plan is the correct fix.
- **After deploying the fix**: existing users may still need **one** more reload (because their currently-installed old SW has to fetch the new SW first). After that, all future updates will appear immediately.
- For an immediate manual workaround on your own browser today: DevTools → Application → Service Workers → Unregister, then hard reload.

## Files to change

- `vite.config.ts` — harden the VitePWA/Workbox config (skipWaiting, clientsClaim, cleanupOutdatedCaches, NetworkFirst for navigations).
- `src/main.tsx` — register the SW with auto-reload on update via `virtual:pwa-register`.

No other code, routes, or features are affected.

## Out of scope

- Lovable's hosting/CDN: there's no evidence the platform itself is serving stale files; SPA fallback and redirects in `public/_redirects` look correct.
- Custom domain DNS: domains resolve fine (you're seeing the site, just an old version).
