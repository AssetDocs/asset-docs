

## Add Security Alerts Panel to Notifications Tab

### What Changes

**1. Security Alerts List (Collapsible Panel)**
- Add a new "Security Alerts" section at the top of the Notifications tab, above the existing preference toggles.
- This section will be a collapsible panel (using the existing Radix Collapsible component) that shows recent security alerts fetched from the `user_notifications` table.
- Each alert will display:
  - An icon based on the alert type (shield for security, etc.)
  - The alert title (e.g., "Password Changed", "New Login Detected")
  - The alert message with details about what happened
  - A timestamp showing when the alert occurred
- When there are no alerts, a friendly empty state message will be shown.
- The collapsible follows the dashboard's existing pattern: a clickable bar with a chevron that rotates when collapsed/expanded. It will default to **open** if there are unread alerts, and **closed** if all are read.

**2. Badge on Alerts Tab Clears on Click**
- Already implemented -- clicking the Alerts tab calls `markAllRead()`, which clears the unread badge. No additional changes needed here.

### Technical Details

**File: `src/components/NotificationsTab.tsx`**
- Import `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent` from `@/components/ui/collapsible`.
- Import `ChevronDown`, `ShieldAlert`, `AlertTriangle`, `Clock` icons from `lucide-react`.
- Add a `useEffect` to fetch notifications from `user_notifications` table for the current user, ordered by `created_at DESC`, limited to recent alerts (e.g., last 20).
- Render a collapsible "Security Alerts" card above the "Notification Preferences" card:
  - Trigger bar: "Security Alerts" title with a count badge and rotating chevron.
  - Content: A scrollable list of alert items showing title, message, and relative timestamp (using `date-fns` `formatDistanceToNow`).
  - Each alert item styled with a left border color based on type (red for security, amber for billing, blue for info).
- No database changes needed -- the `user_notifications` table already has all required columns.

**No other files need changes** -- this is entirely contained within the `NotificationsTab` component.

