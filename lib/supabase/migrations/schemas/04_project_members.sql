-- ===========================================
-- Project Members Schema
-- ===========================================
-- Links users to projects with roles

create table project_members (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  role_id uuid references roles(id) on delete restrict,
  invited_by uuid references profiles(id) on delete set null,
  invited_at timestamptz default now(),
  joined_at timestamptz,
  status text default 'pending' check (status in ('pending', 'active', 'inactive')),
  unique(project_id, user_id)
);

-- Indexes
create index idx_project_members_project on project_members(project_id);
create index idx_project_members_user on project_members(user_id);
create index idx_project_members_status on project_members(status);
create index idx_project_members_role on project_members(role_id);

-- Enable RLS
alter table project_members enable row level security;

-- ===========================================
-- Helper Functions
-- ===========================================

-- Check if user is an active project member
create or replace function is_project_member(p_project_id uuid, p_user_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from project_members
    where project_id = p_project_id
    and user_id = p_user_id
    and status = 'active'
  );
end;
$$ language plpgsql security definer;

-- Check if user has specific permission in project
create or replace function has_project_permission(p_project_id uuid, p_user_id uuid, p_permission text)
returns boolean as $$
begin
  return exists (
    select 1 from project_members pm
    join roles r on r.id = pm.role_id
    where pm.project_id = p_project_id
    and pm.user_id = p_user_id
    and pm.status = 'active'
    and r.permissions @> to_jsonb(p_permission)
  );
end;
$$ language plpgsql security definer;

