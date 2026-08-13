# Restore Banner Icon CTAs and Route "Users" to Access & Activity

## Goal

Bring the dashboard welcome banner back to the layout in the screen capture: three small stacked icon tiles on the right side of the blue banner, directly under the Account # chip — Settings, Properties, Users — and point the third one at the authorized-users management view instead of the standalone Activity Log page.

## What changes

1. **Banner CTAs (right side)**
   - Remove the three large yellow/white text buttons currently sitting under the welcome copy on the left.
   - Add a compact row of three icon tiles under the `Account #:` chip, matching the demo dashboard styling exactly: `72x56` tiles, translucent white background, icon above a 10px label.
   - Tiles and destinations:
     - Settings (gear) -> `/account/settings`
     - Properties (home) -> `/account/properties`
     - Users (people) -> `/account?tab=access-activity`
   - Label the third tile "Users" (not "Access" / not "Activity Log"), per the request.

2. **Destination correction**
   - The third CTA no longer navigates to `/account/activity` (the standalone Activity Log page). It goes to the existing Access & Activity section, whose primary purpose is managing authorized users; recent activity remains visible inside that section.
   - The `/account/activity` route and the Activity Log page itself are left untouched and still reachable from the footer/other links.

## Out of scope

- No changes to the Activity Log page's own layout or data.
- No changes to permissions, data models, or any dashboard cards/panels.

## Technical notes

- Single file edit: `src/components/WelcomeBanner.tsx`.
  - Reuse the tile markup pattern already proven in `src/pages/SampleDashboard.tsx` (lines ~62-88), but as `react-router` `Link` elements instead of demo-alert buttons.
  - Keep the existing welcome text, account switcher, resume prompt, account number chip, and mobile "Add to Home Screen" prompt unchanged.
  - Swap `ClipboardList` for `Users` in the `lucide-react` imports.
- Verify with a typecheck after the edit.

## Open question (does not block)

If you also meant the Activity Log page at `/account/activity` had its own layout changed and should be restored, tell me and I will treat that as a separate pass — this plan assumes the fix is the banner plus routing the "Users" CTA to the users-management view.
