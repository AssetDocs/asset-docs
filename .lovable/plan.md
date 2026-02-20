

## Smart Calendar - Full Feature Implementation

### Overview
Add a comprehensive "Smart Calendar" feature to the Insights & Tools section, serving as a combined record-keeper, reminder system, and proof repository for property and asset management.

---

### 1. Database Schema

Create the following tables via migration:

**`calendar_event_categories`** (enum-like reference)
- Uses a Postgres enum type `calendar_event_category` with all specified categories (home_property, maintenance_care, utilities_household, appliances_systems, warranties_coverage, property_lifecycle, compliance_filings, equipment_assets, subscriptions_auto_drafts, hr_admin, tenant_lifecycle, inspections_turnover, rent_financial, legal_compliance, legal_document_reviews, authorized_user_reviews, legacy_emergency_planning)

**`calendar_events`** table:
- `id` (uuid, PK)
- `user_id` (uuid, NOT NULL, references auth.users via RLS)
- `title` (text, NOT NULL)
- `category` (calendar_event_category)
- `start_date` (date, NOT NULL)
- `end_date` (date, nullable -- for date ranges)
- `recurrence` (text: 'one_time', 'daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'semi_annual', 'annual')
- `recurrence_end_date` (date, nullable)
- `linked_property_id` (uuid, nullable, references properties)
- `linked_asset_id` (uuid, nullable, references items)
- `notes` (text, nullable)
- `status` (text: 'upcoming', 'overdue', 'completed', default 'upcoming')
- `is_suggested` (boolean, default false -- for auto-generated events)
- `is_dismissed` (boolean, default false -- for dismissed suggestions)
- `template_key` (text, nullable -- tracks which template created it)
- `visibility` (text: 'private', 'shared', 'emergency_only', default 'private')
- `notify_day_of` (boolean, default true)
- `notify_1_week` (boolean, default false)
- `notify_30_days` (boolean, default false)
- `completed_at` (timestamptz, nullable)
- `created_at` / `updated_at` (timestamptz)

**`calendar_event_attachments`** table:
- `id` (uuid, PK)
- `event_id` (uuid, references calendar_events ON DELETE CASCADE)
- `user_id` (uuid, NOT NULL)
- `file_name` (text)
- `file_path` (text)
- `file_type` (text)
- `file_size` (bigint)
- `created_at` (timestamptz)

**RLS Policies:**
- Users can CRUD their own events
- Contributors with 'viewer' role can SELECT events where visibility = 'shared'
- Contributors with 'contributor'/'administrator' role can also INSERT/UPDATE shared events
- Emergency-only events visible to delegates

**Trigger:** `update_updated_at_column` on calendar_events for auto-updating `updated_at`.

---

### 2. New Files to Create

**Components:**
- `src/components/SmartCalendar.tsx` -- Main calendar page with month/list view toggle
- `src/components/calendar/CalendarMonthView.tsx` -- Month grid rendering events as color-coded dots/chips
- `src/components/calendar/CalendarListView.tsx` -- Chronological list of events grouped by date
- `src/components/calendar/CalendarEventModal.tsx` -- Create/edit event dialog with all fields
- `src/components/calendar/CalendarEventCard.tsx` -- Individual event display (used in both views)
- `src/components/calendar/CalendarFilters.tsx` -- Filter bar (category, property, asset, status)
- `src/components/calendar/CalendarTemplates.tsx` -- Pre-built template selector dialog
- `src/components/calendar/SuggestedEvents.tsx` -- Display auto-suggested events with accept/edit/dismiss
- `src/components/calendar/EventAttachments.tsx` -- Attachment upload/display for events

**Hooks:**
- `src/hooks/useCalendarEvents.ts` -- CRUD operations, filtering, fetching events
- `src/hooks/useCalendarNotifications.ts` -- Check for today's events, return count for badge
- `src/hooks/useSuggestedEvents.ts` -- Query existing data (warranties, insurance, leases) to generate suggestions

---

### 3. Modifications to Existing Files

**`src/components/InsightsToolsGrid.tsx`**
- Add a new "Smart Calendar" DashboardGridCard with the `CalendarDays` icon
- Include a notification badge (red dot/count) showing today's event count
- On click, call `onTabChange('smart-calendar')`

**`src/pages/Account.tsx`**
- Add `'smart-calendar'` to the section config map with title "Smart Calendar" and subtitle "Reminders, records, and timelines -- all in one place."
- Add a new `<TabsContent value="smart-calendar">` rendering `<SmartCalendar />`
- Add `'smart-calendar'` to the back-navigation list that shows "Back to Insights & Tools"

**`src/components/DashboardGrid.tsx`**
- On the "Insights & Tools" card, add a notification badge showing today's calendar event count (similar to Account Settings unread badge pattern)

---

### 4. Feature Details

**Month View (default)**
- Standard calendar grid with days of the month
- Events shown as small color-coded pills/dots within each day cell
- Click a day to see events for that day in a side panel or expanded row
- Click an event to open the event detail/edit modal
- Navigation arrows for previous/next month

**List View (toggle)**
- Grouped by date (Today, This Week, This Month, Upcoming, Overdue)
- Each event shows: title, category badge, date, status indicator, linked property name
- Color-coded left border by category

**Event Categories -- Color Coding (subtle, accessible)**
- Home & Property group: blue shades
- Business & Operations group: green shades
- Landlord & Rental group: purple shades
- Estate & Legacy group: amber shades

**Event Creation/Edit Modal**
- Title (required text input)
- Category (dropdown with all categories grouped by persona)
- Start Date / End Date (date pickers)
- Recurrence selector (one-time, daily, weekly, biweekly, monthly, quarterly, semi-annual, annual)
- Recurrence end date (optional)
- Linked Property (dropdown of user's properties)
- Linked Asset (dropdown of user's items)
- Notes/Description (textarea)
- Attachments section (upload documents, photos, invoices using existing storage buckets)
- Visibility (private / shared / emergency-only)
- Notification preferences (day of, 1 week before, 30 days before -- checkboxes)
- Status (upcoming / completed)

**Pre-Built Templates**
- Organized by persona (Homeowner, Business Owner, Landlord, Estate)
- Each template pre-fills: title, category, recurrence, and notification settings
- User selects template, then customizes before saving
- All templates from the specification included

**Suggested Events (Phase 1 -- Read Only)**
- Query existing data to surface suggestions:
  - Items with warranty dates approaching expiration
  - Insurance policies with renewal dates
  - Properties with lease end dates (if tracked)
- Displayed in a "Suggested Events" section at top of calendar
- User can Accept (creates real event), Edit (opens modal pre-filled), or Dismiss

**Notification Badge on Insights & Tools Card**
- `useCalendarNotifications` hook queries `calendar_events` where `start_date = today` and `status = 'upcoming'`
- Returns count displayed as red badge on the Smart Calendar card icon in InsightsToolsGrid
- Also adds badge count to the Insights & Tools card on the main dashboard

**Event Status Management**
- Events with `start_date` in the past and `status = 'upcoming'` shown as "Overdue" (red indicator)
- User can mark events "Completed" which sets `completed_at` and `status = 'completed'`
- Completed events persist as historical records, shown in a muted style

---

### 5. UI/UX Design Principles

- Clean, calm layout -- no busy visuals; generous whitespace
- Muted, accessible color coding for categories
- Events visually indicate status: upcoming (default), overdue (red accent), completed (muted/strikethrough)
- "Things I don't want to forget -- but also don't want to think about" aesthetic
- Mobile-responsive: month view collapses gracefully, list view is primary on small screens
- Uses existing shadcn/ui components (Dialog, Select, Popover, Calendar, Badge, Tabs, Card)

---

### 6. Implementation Sequence

1. Database migration (create enum, tables, RLS policies, trigger)
2. Create `useCalendarEvents` hook (CRUD operations)
3. Create `useCalendarNotifications` hook (today's event count)
4. Build `CalendarEventModal` (create/edit form)
5. Build `CalendarMonthView` and `CalendarListView`
6. Build `CalendarFilters` and `CalendarTemplates`
7. Build `SmartCalendar` main component (assembles everything)
8. Build `SuggestedEvents` component
9. Build `EventAttachments` component
10. Update `InsightsToolsGrid` with new card + badge
11. Update `Account.tsx` with new tab content + back navigation
12. Update `DashboardGrid` Insights & Tools card with badge

