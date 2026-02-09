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
