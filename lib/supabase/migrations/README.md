# Supabase Migrations

This folder contains all SQL migrations for the WeConnect application, organized by purpose.

## Folder Structure

```
migrations/
├── schemas/       # Table definitions and triggers
├── policies/      # Row Level Security (RLS) policies
├── seeds/         # Seed data for tables
└── README.md      # This file
```

## Execution Order

When setting up a new database, run files in this order:

### 1. Schemas (in order)
```sql
-- Run in order: 00 → 10
schemas/00_extensions.sql
schemas/01_profiles.sql
schemas/02_projects.sql
schemas/03_roles.sql             -- References projects(id)
schemas/04_project_members.sql   -- Contains helper functions & triggers
schemas/05_ticket_states.sql
schemas/06_ticket_priorities.sql
schemas/07_tickets.sql
schemas/08_events.sql
schemas/09_event_attendees.sql
schemas/10_storage.sql
```

### 2. Policies (in order)
```sql
-- Run in order: 01 → 10
policies/01_profiles_policies.sql
policies/02_roles_policies.sql
policies/03_projects_policies.sql
policies/04_project_members_policies.sql
policies/05_ticket_states_policies.sql
policies/06_ticket_priorities_policies.sql
policies/07_tickets_policies.sql
policies/08_events_policies.sql
policies/09_event_attendees_policies.sql
policies/10_storage_policies.sql
```

### 3. Seeds (required)
```sql
seeds/01_roles.sql              -- Required: System roles
seeds/03_demo_ticket_states.sql -- Required: Default template states
seeds/04_demo_ticket_priorities.sql -- Required: Default template priorities
```

### 4. Seeds (optional - demo data)
```sql
-- Uncomment and modify with real user IDs
seeds/02_demo_projects.sql
seeds/05_demo_tickets.sql
```

## Tables Overview

| Table | Description |
|-------|-------------|
| `profiles` | User profiles (synced from auth.users) |
| `roles` | System and custom roles with permissions |
| `projects` | Main project entity |
| `project_members` | Links users to projects with roles |
| `ticket_states` | Workflow states (To Do, In Progress, etc.) |
| `ticket_priorities` | Priority levels (Low, Medium, High, Urgent) |
| `tickets` | Main ticket/task entity |
| `events` | Project events and personal events with scheduling |
| `event_attendees` | Event invitations and RSVPs |

## Helper Functions

### `is_project_member(project_id, user_id)`
Returns `true` if user is an active member of the project.

### `has_project_permission(project_id, user_id, permission)`
Returns `true` if user has the specified permission in the project.

## Available Permissions

| Permission | Description |
|------------|-------------|
| `manage_project` | Full project settings access |
| `manage_members` | Invite/remove members, assign roles |
| `manage_roles` | Create/modify custom roles |
| `manage_tickets` | Full ticket CRUD |
| `manage_states` | Create/modify ticket states |
| `manage_priorities` | Create/modify priorities |
| `manage_events` | Full event CRUD |
| `create_tickets` | Create new tickets |
| `update_own_tickets` | Update tickets created by self |
| `update_tickets` | Update any ticket |
| `comment` | Add comments to tickets |
| `view_tickets` | View-only ticket access |
| `view_reports` | Access to reports/analytics |

## Event Types

| Type | Description |
|------|-------------|
| `meeting` | Project meeting (requires project_id) |
| `holiday` | Holiday event (personal, no project) |
| `out_of_office` | Out of office (personal, no project) |
| `sick_leave` | Sick leave (personal, no project) |
| `personal` | General personal event (no project) |

## Triggers

| Trigger | Table | Description |
|---------|-------|-------------|
| `on_auth_user_created` | `auth.users` | Auto-creates profile on signup |
| `on_project_created` | `projects` | Auto-adds creator as Owner |
| `on_event_created` | `events` | Auto-adds creator as attendee |

## RLS Policy Summary

Every table with RLS enabled has policies for all 4 operations (SELECT, INSERT, UPDATE, DELETE):

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `profiles` | Everyone | Own profile | Own profile | Own profile |
| `roles` | System roles + project members | `manage_roles` | `manage_roles` (custom only) | `manage_roles` (custom only) |
| `projects` | Creator or member | Authenticated (own) | Creator or `manage_project` | Creator only |
| `project_members` | Members or own invite | `manage_members` | `manage_members` or self | `manage_members` or self |
| `ticket_states` | Templates + members | `manage_states` | `manage_states` | `manage_states` |
| `ticket_priorities` | Templates + members | `manage_priorities` | `manage_priorities` | `manage_priorities` |
| `tickets` | Members | `create_tickets` / `manage_tickets` | Tiered (own/any) | `manage_tickets` |
| `events` | Members (project) / Creator (personal) | `manage_events` (project) / Own (personal) | Same as SELECT | Same as SELECT |
| `event_attendees` | Via event access | Event manager or creator | Self RSVP or manager | Self leave or manager |
| `storage.objects` | Public (avatars) | Authenticated | Own folder | Own folder |

## RLS Performance Tips

1. **Wrap auth functions**: Use `(select auth.uid())` instead of `auth.uid()`
2. **Specify roles**: Use `to authenticated` when policy only applies to logged-in users
3. **Index policy columns**: Ensure columns used in policies are indexed

---

# WeConnect — User Scenarios & Permission Reference

## Table of Contents

1. [Role-Based Access Control](#role-based-access-control)
2. [Member Management](#member-management)
3. [Event Management](#event-management)
4. [Personal Events](#personal-events)
5. [Ticket Management](#ticket-management)
6. [Custom States & Priorities](#custom-states--priorities)
7. [Custom Roles](#custom-roles)
8. [Permission Matrix](#permission-matrix)
9. [Frontend Permission Enforcement](#frontend-permission-enforcement)

---

## Role-Based Access Control

### System Roles (Seed Defaults)

| Role      | Description                            |
|-----------|----------------------------------------|
| Owner     | Full access — all permissions          |
| Admin     | Member/ticket/event management         |
| Manager   | Ticket/state/priority management       |
| Developer | Create/update own tickets, comment     |
| Guest     | View-only access to tickets            |

### How Roles Work

- Every project member has exactly one **role**.
- The **project creator** is automatically assigned the **Owner** role.
- Roles are resolved at the database level using `has_project_permission(project_id, user_id, permission)`.
- The frontend uses the `useProjectPermissions(projectId)` hook and `<PermissionGate>` component to conditionally render UI elements.

### Role Scoping

- **System roles** (`is_system = true`, `project_id = NULL`): Shared across all projects, read-only.
- **Custom roles** (`is_system = false`, `project_id = <uuid>`): Scoped to a single project, fully editable by users with `manage_roles` permission.

---

## Member Management

### Scenario: Invite a Member

1. User navigates to **Project > Members** tab.
2. Clicks **Invite Member** (requires `manage_members` permission).
3. Searches for a user by email/username.
4. Selects a role for the new member.
5. The invited user appears with **pending** status.
6. Once the user accepts, their status becomes **active**.

### Scenario: Remove a Member

1. In the Members tab, click the remove icon next to a member.
2. Confirm the removal in the dialog.
3. Requires `manage_members` permission — the button is hidden for users without it.
4. Users cannot remove themselves.

### Access Rules

| Action         | Required Permission |
|----------------|---------------------|
| View members   | Project membership  |
| Invite member  | `manage_members`    |
| Remove member  | `manage_members`    |
| Change role    | `manage_members`    |

---

## Event Management

### Event Types

| Type           | Description                                  |
|----------------|----------------------------------------------|
| `meeting`      | Team meeting with attendees and optional URL  |
| `holiday`      | Holiday / day off                             |
| `out_of_office` | Out of office                                |
| `sick_leave`   | Sick leave                                   |
| `personal`     | General personal event                       |

### Scenario: Create a Project Event

1. Navigate to **Project > Calendar** tab.
2. Click on a date or the calendar's create button.
3. Fill in: title, description, start/end date & time, event type, attendees, event URL.
4. Requires `manage_events` permission.
5. The creator is automatically added as an attendee (via database trigger).

### Scenario: View Event Details

1. Click on any event in the calendar (month, week, or day view).
2. The event detail dialog shows: title, description, times, type badge, project badge, attendees with RSVP status.
3. Attendees can update their status (accepted / declined / tentative).

### Scenario: View Events Across Projects

1. Navigate to the **global calendar** page (`/calendar`).
2. All events the user is part of (as creator or attendee) across all projects are shown.
3. Stats cards show: today's events, upcoming count, and number of projects with events.
4. Today's schedule shows a quick-view strip of events.

### Access Rules

| Action           | Required Permission         |
|------------------|-----------------------------|
| View events      | Project membership          |
| Create event     | `manage_events`             |
| Edit/delete event| `manage_events`             |
| RSVP to event    | Being an attendee           |

---

## Personal Events

### Scenario: Create a Personal Event

1. On the **global calendar** page, click **Personal Event** button.
2. Select event type: Holiday, Out of Office, Sick Leave, or Personal.
3. Fill in title, description, start/end date & time.
4. No project or attendees required — the event belongs only to the user.

### How Personal Events Work

- `project_id` is `NULL` for personal events.
- RLS policies allow users to SELECT/INSERT/UPDATE/DELETE their own personal events.
- Personal events appear in the global calendar alongside project events.
- In event cards, personal events show a type badge instead of a project badge.

---

## Ticket Management

### Scenario: Create a Ticket

1. In the **Board** tab, click **Add Task** (requires `create_tickets` or `manage_tickets`).
2. Fill in: title, description, state, priority.
3. The ticket appears in the corresponding state column.

### Scenario: Edit/Delete a Ticket

1. Click a ticket card to open the detail dialog.
2. Click the edit icon to modify (requires `manage_tickets` or `update_own_tickets`).
3. Click the delete icon to remove (requires `manage_tickets` only).

### Access Rules

| Action          | Required Permission                        |
|-----------------|--------------------------------------------|
| View tickets    | `view_tickets` (or any member role)        |
| Create ticket   | `create_tickets` or `manage_tickets`       |
| Edit any ticket | `manage_tickets`                           |
| Edit own ticket | `update_own_tickets` or `manage_tickets`   |
| Delete ticket   | `manage_tickets`                           |

---

## Custom States & Priorities

### Default Templates

The system provides **template states and priorities** (with `project_id = NULL`) that serve as defaults:

**Default States:** Backlog, To Do, In Progress, In Review, Done

**Default Priorities:** Urgent, High, Medium, Low

### Scenario: Add a State/Priority

1. Navigate to **Project > Settings** tab (requires settings-related permissions).
2. In the States or Priorities card, click **Add State** / **Add Priority**.
3. Fill in: name, color.
4. The new state/priority is scoped to the current project.

### Scenario: Use Defaults as Starting Point

- When creating a new project, states and priorities can be seeded from the default templates.
- Default templates are visible to all authenticated users (SELECT policy allows `project_id IS NULL`).

### Access Rules

| Action           | Required Permission    |
|------------------|------------------------|
| View states      | Project membership     |
| Create/edit/delete states | `manage_states` |
| View priorities  | Project membership     |
| Create/edit/delete priorities | `manage_priorities` |

---

## Custom Roles

### Scenario: Create a Custom Role

1. Navigate to **Project > Settings** tab.
2. In the **Roles** card (visible only with `manage_roles` permission), click **Add Role**.
3. Enter: name, description, and select permissions from the checklist.
4. The custom role is scoped to the current project.

### Scenario: View System Roles

1. In the Roles card, system roles (Owner, Admin, etc.) are shown with a "System" badge.
2. Clicking a system role opens a read-only view of its permissions.
3. System roles cannot be edited or deleted.

### Scenario: Assign a Custom Role

1. When inviting a member, the role dropdown includes both system roles and project-specific custom roles.
2. Custom roles appear alongside system roles in the selection.

### Available Permissions

| Permission          | Description                          |
|---------------------|--------------------------------------|
| `manage_project`    | Full project settings access         |
| `manage_members`    | Invite/remove members, assign roles  |
| `manage_roles`      | Create/modify custom roles           |
| `manage_tickets`    | Full ticket CRUD                     |
| `manage_states`     | Create/modify ticket states          |
| `manage_priorities` | Create/modify priorities             |
| `manage_events`     | Full event CRUD                      |
| `create_tickets`    | Create new tickets                   |
| `update_own_tickets`| Update tickets created by self       |
| `update_tickets`    | Update any ticket                    |
| `comment`           | Add comments to tickets              |
| `view_tickets`      | View-only ticket access              |
| `view_reports`      | Access to reports/analytics          |

---

## Permission Matrix

| Action                    | Owner | Admin | Manager | Developer | Guest |
|---------------------------|:-----:|:-----:|:-------:|:---------:|:-----:|
| Manage project settings   |   Y   |       |         |           |       |
| Manage members            |   Y   |   Y   |         |           |       |
| Manage roles              |   Y   |       |         |           |       |
| Manage tickets            |   Y   |   Y   |    Y    |           |       |
| Manage states             |   Y   |       |    Y    |           |       |
| Manage priorities         |   Y   |       |    Y    |           |       |
| Manage events             |   Y   |   Y   |         |           |       |
| Create tickets            |   Y   |   Y   |    Y    |     Y     |       |
| Update own tickets        |   Y   |   Y   |    Y    |     Y     |       |
| Update any ticket         |   Y   |   Y   |    Y    |           |       |
| Comment on tickets        |   Y   |   Y   |    Y    |     Y     |       |
| View tickets              |   Y   |   Y   |    Y    |     Y     |   Y   |
| View reports              |   Y   |   Y   |    Y    |           |       |

---

## Frontend Permission Enforcement

### Architecture

Permission enforcement happens at **two layers**:

1. **Database (RLS)**: Row Level Security policies prevent unauthorized data access regardless of frontend state. This is the source of truth.
2. **Frontend (PermissionGate)**: UI elements are conditionally rendered to provide a clean UX — users don't see buttons they can't use.

### Hook: `useProjectPermissions(projectId)`

```typescript
const { hasPermission, isOwner, isMember, isLoading } = useProjectPermissions(projectId);

// Check a single permission
if (hasPermission("manage_tickets")) { /* ... */ }

// Check ownership
if (isOwner) { /* full access */ }
```

### Component: `<PermissionGate>`

```tsx
// Single permission
<PermissionGate projectId={projectId} permission="manage_members">
  <Button>Invite Member</Button>
</PermissionGate>

// Any of multiple permissions
<PermissionGate projectId={projectId} permission={["create_tickets", "manage_tickets"]}>
  <CreateTicketDialog />
</PermissionGate>

// With fallback
<PermissionGate projectId={projectId} permission="manage_events" fallback={<p>Read-only</p>}>
  <EventForm />
</PermissionGate>
```

### Integration Points

| Component                  | Permission Gate                                        |
|----------------------------|--------------------------------------------------------|
| Create Ticket button       | `create_tickets` or `manage_tickets`                   |
| Edit/Delete ticket buttons | `manage_tickets` or `update_own_tickets`               |

