# Mobile "Add to Home Screen" Refinement (points shortcut at /account)

## Audit findings (verified)

- Existing mobile prompt: `src/components/WelcomeBanner.tsx` (the orange "One-Tap Mobile Access" strip). It renders only inside the authenticated dashboard banner.
- Current behavior: collapsible strip with a "Learn How" button that links to the separate `/install` page, plus a "Don't show again" dismiss.
- Dismissal persistence: `localStorage` keys `installPromptDismissed` and `installPromptCollapsed`. No DB state.
- Visibility gate: `useIsMobile()` + not `display-mode: standalone` + not dismissed.
- Instruction content lives on `src/pages/Install.tsx` — a full public page with Navbar/Footer, Chrome/Edge/iOS Safari sections, `beforeinstallprompt` handling, and offline-caching claims.
- No `manifest` link and no manifest file exist; `src/main.tsx` unregisters service workers and clears caches. Only `mobile-web-app-capable`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-mobile-web-app-title` meta tags in `index.html`.
- `/install` instructions currently tell users to visit `https://getassetsafe.com` (Chrome) and `https://assetsafe.net` (iOS) — i.e. the marketing homepage, which is the exact problem: the shortcut captures whatever URL is open.

## Problem

Without a manifest/`start_url`, the home-screen shortcut records the currently open URL. Today users are pointed at the homepage (or are on a nested `/account/...` route), so their icon does not open the dashboard.

## Fix

Keep one prompt, in `WelcomeBanner`, and make the help flow put the browser on `/account` before showing device-specific instructions inline.

### 1. Reuse and extend the existing prompt

- Replace the "Learn How" link-to-`/install` with a "Show Me How" action that:
  1. If `location.pathname !== '/account'`, calls React Router `navigate('/account', { replace: true })` (client-side, session and account context untouched).
  2. Expands an inline instructions panel inside the same orange strip (no new modal system, no redesign).
- Detect platform with simple user-agent checks already used on `/install`: iOS (iPad/iPhone/iPod, including iPadOS desktop-mode), Android, other. Also detect non-Safari on iOS (Chrome/Firefox/Edge iOS tokens) to show the Safari note.
- Keep dismissal/collapse behavior and both localStorage keys exactly as-is.

### 2. Copy

Headline: **Add Asset Safe to Your Home Screen**
Subcopy: "Get quick access to your Asset Safe dashboard right from your home screen."
Confirmation line under both instruction sets: "Asset Safe will appear on your home screen and open directly to your dashboard sign-in or account."

iOS steps: Tap the Share button in Safari → Scroll down and tap Add to Home Screen → Tap Add.
Non-Safari iOS note: "For the easiest setup, open Asset Safe in Safari and go to your dashboard before adding it to your home screen."

Android/Chrome steps: Open the Chrome menu (⋮) → Choose Add to Home screen (or the equivalent shortcut option Chrome shows) → Confirm.

No "download", "install the app", "native app", or App Store language in the prompt.

### 3. Update /install to match

Leave the page in place and keep its layout, but fix the misleading parts: point the URL guidance at `https://getassetsafe.com/account` instead of the homepage, drop the offline/secure-caching claims (no service worker exists), and drop the `beforeinstallprompt` "Install Now" button and its event listener since there is no manifest for Chrome to install against.

### 4. Explicitly out of scope

- No manifest, `start_url`, scope, service worker, offline caching, workbox, or PWA plugin. The service-worker cleanup in `src/main.tsx` stays untouched.
- Existing meta tags stay as they are (iOS standalone launch behavior preserved).
- No changes to auth, public marketing routes, or desktop behavior.

### 5. Analytics (optional, existing helper only)

Use `track()` from `src/lib/track.ts` for `mobile_home_shortcut_prompt_shown`, `mobile_home_shortcut_help_opened`, `mobile_home_shortcut_dismissed`. No payload beyond platform string.

## Files to change

- `src/components/WelcomeBanner.tsx` — navigate-to-`/account` + inline platform-specific instructions + copy.
- `src/pages/Install.tsx` — corrected URLs, removed offline claims and `beforeinstallprompt` block.

## Verification

Build + TypeScript no-emit check, then Playwright at mobile viewport: prompt renders on `/account`; from a nested route the help action lands on `/account` with the session intact; iOS vs Android instruction branches render correct text; dismissal persists across reload; desktop shows no prompt; confirm no manifest link and no SW registration.

## Known limitation (documented, not fixed here)

Unauthenticated deep links to nested protected routes (e.g. `/account/contacts`) lose the original destination and return to `/account` after login. Follow-up candidate only.

## Approved refinements (revision)

### Android copy
Use, without emphasizing "Install app":
"Open the Chrome menu (⋮) → choose **Add to Home screen** or the shortcut option shown by Chrome → confirm."

### Prompt wording
- Headline: "Add Asset Safe to Your Home Screen"
- Supporting copy: "Get quick, app-like access to your Asset Safe dashboard right from your home screen."
- Primary CTA: "Show Me How"; secondary: "Maybe Later" (rename the current "Don't show again" control, same localStorage persistence).
- Confirmation line: "Asset Safe will appear on your home screen for quick, app-like access to your dashboard."

### /install page rewrite (no offline claims)
- Title: "Add Asset Safe to Your Home Screen"; subtitle: "Quick, app-like access to your Asset Safe dashboard".
- Intro: "Asset Safe works directly from your browser and can be added to your device's home screen for quick access to your dashboard."
- Benefits list becomes exactly: one-tap access to your dashboard / opens directly to your Asset Safe sign-in or account / uses the same secure Asset Safe experience as the full website.
- Delete the entire "Important Notes About Offline Access" card and any wording implying cached or offline access.
- Section titles become action-oriented: "How to add Asset Safe to your home screen in Chrome", etc.; "Confirm installation" becomes "Confirm the shortcut". Result lines describe home-screen access, not "standalone app" or "app-style window".
- URLs in steps point to `https://getassetsafe.com/account` (replacing the homepage and the `assetsafe.net` reference).
- Remove the `beforeinstallprompt` "Install Now" button/listener and the "already installed" card's app-install framing.
- SEOHead title/description/keywords lose "install the app" and "progressive web app" phrasing in favor of home-screen/dashboard-access wording.

### Terminology audit results (customer-facing only)
- `src/components/Footer.tsx:90` — change the visible label "Install App" to "Add to Home Screen" (link target unchanged).
- `src/pages/HabitatPilot.tsx:168` — "One-tap access via mobile home screen" already compliant; leave as-is.
- Internal/technical occurrences left untouched: `src/main.tsx` comment, `src/utils/structuredData.ts` comment, admin-only `RoadmapTab.tsx` and `AdminLegalAgreements.tsx`, and `StateRequirements.tsx` (about government apps, unrelated).

### Unchanged
Routing, `/account` shortcut targeting, auth, service-worker cleanup, manifest absence, mobile detection, dismissal persistence, subscription logic, dashboard behavior, public site structure. No "Why isn't Asset Safe in the App Store?" explainer in this pass.
