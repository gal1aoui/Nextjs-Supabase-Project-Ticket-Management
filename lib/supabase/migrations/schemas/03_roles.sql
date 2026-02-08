-- ===========================================
-- Roles Schema
-- ===========================================
-- System and custom roles for project access control

create table roles (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  permissions jsonb default '[]'::jsonb,
  is_system boolean default false,
  project_id uuid references projects(id) on delete cascade,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now(),
  unique(name, project_id)
);

-- Indexes
create index idx_roles_project on roles(project_id);
create index idx_roles_system on roles(is_system);

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
-- manage_events      - Full event CRUD
-- create_tickets     - Create new tickets
-- update_own_tickets - Update tickets created by self
-- update_tickets     - Update any ticket
-- comment            - Add comments to tickets
-- view_tickets       - View-only ticket access
-- view_reports       - Access to reports/analytics
