# Preview panel showing an older version — audit findings and fix

## What I checked

- The preview server is running and answering normally.
- The project files contain all of the recent work: the new homepage hero line ("...ready when it matters"), the updated YouTube link, the Professionals page and its navigation entry, the new blog header image, and the blog spacing styles.
- The page the preview server hands back is the current one (current title, current social preview details).
- The most recent saved changes are all in place, newest first: replaced post header image, Professionals page and navigation.

So the app itself is current. Nothing old is being served. What the preview panel is showing is a stale copy held in the browser.

## Why this happens

This project used to install a background helper in visitors' browsers (an offline cache). That was removed, and the app now deletes it on load — but a browser that still has the old cached copy will show that old copy first, and only clean itself up afterwards. The result is exactly what you describe: the live site looks right, the preview panel looks behind.

## Plan

1. Confirm which page and which specific element looks out of date in your preview panel, so we're fixing the right thing (for example: homepage wording, footer, blog image).
2. Force the preview panel to drop its stored copy: open the preview in its own browser tab and do a hard reload (Cmd+Shift+R / Ctrl+Shift+R). If it still looks old, clear site data for the preview address once.
3. Re-check the same page in the preview panel afterwards and compare it against the live site side by side.
4. If it is still stale after that, add a small one-time freshness check to the app so any browser holding an old copy reloads itself automatically instead of relying on a manual clear. This is the only code change in this plan, and only if step 3 shows the problem persists.

## Technical notes

- Files verified as current: `src/components/HeroSection.tsx`, `src/components/Footer.tsx`, `src/pages/Professionals.tsx`, `src/data/audienceNav.ts`, `src/pages/Blog.tsx`, `src/index.css`.
- `src/main.tsx` already unregisters every service worker and clears all Cache Storage entries on startup, but that cleanup runs after the stale bundle has booted, so one extra reload is required per affected browser.
- Optional step 4 implementation: after the cleanup block resolves, if any registration or cache key was actually removed, call `location.reload()` once (guarded by a `sessionStorage` flag so it can never loop).
