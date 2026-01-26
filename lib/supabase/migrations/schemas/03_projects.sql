-- ===========================================
-- Projects Schema
-- ===========================================
-- Main project entity

create table projects (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  color text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid references auth.users(id) on delete cascade
);

-- Indexes
create index idx_projects_created_by on projects(created_by);

-- Enable RLS
alter table projects enable row level security;
