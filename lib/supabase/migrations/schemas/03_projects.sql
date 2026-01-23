-- ===========================================
-- Projects Schema
-- ===========================================
-- Main project entity

create table projects (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  color text,
  workspace_id uuid, -- For future multi-workspace support
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid references auth.users(id) on delete cascade
);

-- Indexes
create index idx_projects_created_by on projects(created_by);
create index idx_projects_workspace on projects(workspace_id);

-- Enable RLS
alter table projects enable row level security;
