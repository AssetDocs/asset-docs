

# Interactive Development Workspace

## Overview
Transform the Development workspace from static mock data to a fully interactive, collaborative environment where all invited dev team members can track progress, manage tasks, report bugs, and share notes in real-time.

## What You'll Get
- **Task Board**: Add, edit, and drag tasks between columns (To Do, In Progress, Done)
- **Bug Tracker**: Report and track bugs with severity levels and assignments
- **Team Notes**: Shared notes visible to all team members
- **Blockers**: Flag items needing owner attention with resolution tracking
- **Decisions Log**: Document technical decisions with rationale
- **Milestones**: Track sprint deadlines and release schedules

---

## Technical Implementation

### Phase 1: Database Schema (Migration)

Create six new tables for the dev workspace:

```text
+------------------+     +------------------+     +------------------+
|    dev_tasks     |     |    dev_bugs      |     |    dev_notes     |
+------------------+     +------------------+     +------------------+
| id (uuid)        |     | id (uuid)        |     | id (uuid)        |
| title            |     | title            |     | content          |
| description      |     | description      |     | author_id        |
| status (enum)    |     | severity (enum)  |     | created_at       |
| priority (enum)  |     | status (enum)    |     | updated_at       |
| assignee_id      |     | reporter_id      |     +------------------+
| created_by       |     | assignee_id      |
| created_at       |     | created_at       |
| updated_at       |     | updated_at       |
+------------------+     +------------------+

+------------------+     +------------------+     +------------------+
|  dev_blockers    |     | dev_decisions    |     | dev_milestones   |
+------------------+     +------------------+     +------------------+
| id (uuid)        |     | id (uuid)        |     | id (uuid)        |
| title            |     | decision         |     | title            |
| description      |     | rationale        |     | description      |
| type (enum)      |     | approved_by      |     | due_date         |
| status           |     | decided_at       |     | status           |
| created_by       |     | created_by       |     | created_by       |
| resolved_by      |     | created_at       |     | created_at       |
| created_at       |     +------------------+     +------------------+
| resolved_at      |
+------------------+
```

**Enums to create:**
- `dev_task_status`: 'todo', 'in_progress', 'done', 'archived'
- `dev_task_priority`: 'low', 'medium', 'high', 'critical'
- `dev_bug_severity`: 'minor', 'major', 'critical', 'blocker'
- `dev_bug_status`: 'open', 'investigating', 'fixed', 'closed', 'wont_fix'
- `dev_blocker_type`: 'owner_question', 'dependency', 'technical', 'external'
- `dev_blocker_status`: 'open', 'resolved', 'deferred'

### Phase 2: Row-Level Security

All tables will use the existing `has_dev_workspace_access()` function:

```sql
-- Example policy (applied to all dev_* tables)
CREATE POLICY "Dev team can manage tasks"
ON public.dev_tasks
FOR ALL
TO authenticated
USING (public.has_dev_workspace_access(auth.uid()))
WITH CHECK (public.has_dev_workspace_access(auth.uid()));
```

This ensures:
- Only invited dev team members can read/write
- All team members see the same data (shared workspace)
- Changes sync in real-time across sessions

### Phase 3: React Hooks

Create a unified hook for workspace data:

**`src/hooks/useDevWorkspace.ts`**
- Fetch all workspace data (tasks, bugs, notes, blockers, decisions, milestones)
- CRUD operations for each entity type
- Real-time subscriptions via Supabase channels
- Optimistic UI updates with rollback on error

### Phase 4: UI Components

**New modal components:**
- `AddTaskModal.tsx` - Form for creating tasks with title, description, priority, assignee
- `AddBugModal.tsx` - Bug report form with severity, steps to reproduce, expected behavior
- `AddNoteModal.tsx` - Simple textarea for team notes
- `AddBlockerModal.tsx` - Blocker form with type selection (Owner Question, Dependency, etc.)
- `AddDecisionModal.tsx` - Decision form with rationale field
- `AddMilestoneModal.tsx` - Milestone form with due date picker

**Interactive features:**
- Task cards become clickable/draggable
- Status updates via dropdown or drag-and-drop
- Edit/delete buttons on hover
- Assignment dropdown populated with team members
- Timestamps and author attribution on all items

### Phase 5: Update AdminDevWorkspace

Refactor the component to:
1. Use `useDevWorkspace` hook instead of mock data
2. Wire up "Add" buttons to open modal dialogs
3. Add edit/delete actions to existing items
4. Show loading states during data fetch
5. Display "Created by" and timestamps on items

---

## File Changes Summary

| Action | File |
|--------|------|
| Create | `supabase/migrations/[timestamp]_dev_workspace_tables.sql` |
| Create | `src/hooks/useDevWorkspace.ts` |
| Create | `src/components/admin/dev-workspace/AddTaskModal.tsx` |
| Create | `src/components/admin/dev-workspace/AddBugModal.tsx` |
| Create | `src/components/admin/dev-workspace/AddNoteModal.tsx` |
| Create | `src/components/admin/dev-workspace/AddBlockerModal.tsx` |
| Create | `src/components/admin/dev-workspace/AddDecisionModal.tsx` |
| Create | `src/components/admin/dev-workspace/AddMilestoneModal.tsx` |
| Create | `src/components/admin/dev-workspace/TaskCard.tsx` |
| Create | `src/components/admin/dev-workspace/BugCard.tsx` |
| Modify | `src/components/admin/AdminDevWorkspace.tsx` |
| Modify | `src/integrations/supabase/types.ts` |

---

## Security Notes

- All data is scoped to users with valid dev workspace roles
- RLS enforced at database level (cannot be bypassed from client)
- Author tracking for accountability
- No sensitive business data stored in dev workspace tables

