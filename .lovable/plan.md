# Add to Home Screen: OS + Browser Aware Instructions

Today both the dashboard prompt (`WelcomeBanner`) and `/install` detect only the OS (`android`, `ios-safari`, `ios-other`, `desktop`) and each has its own duplicated detection function. Android always shows Chrome wording, which is why an Android + Edge user sees Chrome steps. There is no way to manually pick a different browser.

## What changes

1. One shared detection + instruction module used by both surfaces.
2. Detection returns a device (Android / iPhone-iPad / Desktop / Unknown) and a browser (Chrome, Edge, Firefox, Samsung Internet, Safari, Unknown), with a confidence flag.
3. A single compact selector, "Instructions for: [Microsoft Edge on Android ▾]", above the steps. The detected combination is preselected; changing it swaps the steps in place with no navigation.
4. When the browser can't be confidently identified: no Chrome fallback. Show "Choose your browser" with the OS preselected and steps appearing only after a browser is chosen. If neither can be identified, a full device + browser selector.
5. Copy stays standardized: headline "Add Asset Safe to Your Home Screen", support line "Get quick, app-like access to your Asset Safe dashboard right from your home screen.", detection label "Using Microsoft Edge on Android", fallback "Using a different browser?", confirmation "Asset Safe will appear on your home screen for quick, app-like access to your dashboard."

## Instruction content (per combination)

- **Android / Chrome** — menu (⋮) → Add to Home screen or the shortcut option shown by Chrome → confirm.
- **Android / Edge** — menu (⋯, bottom bar) → Add to phone → Add to Home screen (Edge labels the entry point differently from Chrome, so the wording is Edge-specific rather than reused).
- **Android / Firefox** — menu (⋮) → Add to Home screen (Firefox may present it under a "Install"/shortcut entry) → confirm.
- **Android / Samsung Internet** — menu (☰) → Add page to → Home screen → Add.
- **Android / Other** — generic: open the browser menu, look for Add to Home screen or a shortcut option, confirm; note that not every Android browser offers it.
- **iPhone / iPad / Safari** — Share → scroll → Add to Home Screen → Add.
- **iPhone / iPad / Chrome, Edge, Firefox, Other** — these can add a shortcut in recent versions but the path varies, so the guidance points to the reliable path: open Asset Safe in Safari, go to your dashboard, then Share → Add to Home Screen. No claim is made about a feature existing in a browser that we can't verify.
- **Desktop combinations** stay on `/install` only, presented separately from the mobile selector.

## Where it appears

- **Dashboard prompt** (`WelcomeBanner`): keeps the same orange strip, same location, same "Show Me How" toggle, same inline area — no modal. The selector plus steps render inside that existing panel. The existing behavior of ensuring the user is on `/account` before showing instructions is unchanged.
- **/install**: replaces the fixed Chrome/Safari cards with the same detection label + selector + one instruction card. Desktop instructions preserved in their own section.

## Untouched

`/account` shortcut targeting, authentication, prompt placement, localStorage dismissal/collapse keys, service-worker cleanup, continued absence of a manifest, subscriptions, dashboard functionality, Authorized User behavior. This is instruction-selection UX only.

## Technical notes

- New `src/lib/homeScreenInstructions.ts`: `detectEnvironment()` returning `{ device, browser, confident }` and a keyed instruction table (`android:edge`, `ios:safari`, …) with title, ordered steps and optional note. Token order matters — check `EdgA`/`EdgiOS`, `SamsungBrowser`, `CriOS`, `FxiOS`, `OPR/OPiOS` before generic `Chrome`, and treat iOS Safari as Safari only when no competing iOS token is present.
- Both `WelcomeBanner.tsx` and `Install.tsx` delete their local `detectMobilePlatform`/`detectPlatform` and consume the shared module.
- Selector uses the existing shadcn `Select` primitive with grouped options (Android, iPhone/iPad, plus Desktop on `/install`).
- `track()` events kept and extended with the detected device/browser and a manual-override event.
- Verification: `tsgo` typecheck plus Playwright runs with spoofed user agents for Android Chrome/Edge/Firefox/Samsung, iOS Safari/Chrome/Edge, an unknown Android UA and an unknown platform, asserting the preselected label and that manual override swaps the steps.
