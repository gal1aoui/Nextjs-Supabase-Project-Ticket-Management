# WeConnect — User Scenarios & Permission Reference

## Table of Contents

1. [Role-Based Access Control](#1-role-based-access-control)
2. [Member Management](#2-member-management)
3. [Event Management (formerly Meetings)](#3-event-management)
4. [Personal Events](#4-personal-events)
5. [Ticket Management](#5-ticket-management)
6. [Custom States & Priorities](#6-custom-states--priorities)
7. [Custom Roles](#7-custom-roles)
8. [Permission Matrix](#8-permission-matrix)
9. [Frontend Permission Enforcement](#9-frontend-permission-enforcement)

---

## 1. Role-Based Access Control

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

## 2. Member Management

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

## 3. Event Management

> Events were previously called "meetings" — the entire codebase has been renamed.

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

## 4. Personal Events

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

## 5. Ticket Management

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

## 6. Custom States & Priorities

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

## 7. Custom Roles

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

## 8. Permission Matrix

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

## 9. Frontend Permission Enforcement

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
| Invite Member button       | `manage_members`                                       |
| Remove Member button       | `manage_members`                                       |
| Add State button           | `manage_states`                                        |
| Add Priority button        | `manage_priorities`                                    |
| Roles card (Settings)      | `manage_roles`                                         |
| Settings tab (visibility)  | `manage_project`, `manage_states`, `manage_priorities`, or `manage_roles` |
| Create Event (calendar)    | `manage_events` (project) or no gate (personal)        |
