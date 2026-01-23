-- ===========================================
-- Roles Schema
-- ===========================================
-- System and custom roles for project access control

create table roles (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  description text,
  permissions jsonb default '[]'::jsonb,
  is_system boolean default false,
  created_at timestamptz default now()
);

-- Enable RLS
alter table roles enable row level security;

-- ===========================================
-- Available Permissions
-- ===========================================
-- manage_project     - Full project settings access
-- manage_members     - Invite/remove members, assign roles
-- manage_roles       - Create/modify roles
-- manage_tickets     - Full ticket CRUD
-- manage_states      - Create/modify ticket states
-- manage_priorities  - Create/modify priorities
-- manage_meetings    - Full meeting CRUD
-- create_tickets     - Create new tickets
-- update_own_tickets - Update tickets created by self
-- update_tickets     - Update any ticket
-- comment            - Add comments to tickets
-- view_tickets       - View-only ticket access
-- view_reports       - Access to reports/analytics
