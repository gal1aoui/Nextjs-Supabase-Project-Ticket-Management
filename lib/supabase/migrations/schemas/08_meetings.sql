-- ===========================================
-- Meetings Schema
-- ===========================================
-- Project meetings with scheduling

create table meetings (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade not null,
  title text not null,
  description text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  location text,
  meeting_url text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint valid_time_range check (end_time > start_time)
);

-- Indexes
create index idx_meetings_project on meetings(project_id);
create index idx_meetings_start_time on meetings(start_time);
create index idx_meetings_created_by on meetings(created_by);
create index idx_meetings_date_range on meetings(project_id, start_time, end_time);

-- Enable RLS
alter table meetings enable row level security;
