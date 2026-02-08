-- ===========================================
-- Events Schema
-- ===========================================
-- Project events and personal events with scheduling

create table events (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  title text not null,
  description text,
  event_type text not null default 'meeting' check (event_type in ('meeting', 'holiday', 'out_of_office', 'sick_leave', 'personal')),
  start_date date not null,
  end_date date not null,
  start_time time not null,
  end_time time not null,
  location text,
  event_url text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint valid_time_range check (end_time > start_time)
);

-- Indexes
create index idx_events_project on events(project_id);
create index idx_events_start_time on events(start_time);
create index idx_events_created_by on events(created_by);
create index idx_events_date_range on events(project_id, start_time, end_time);
create index idx_events_type on events(event_type);

-- Enable RLS
alter table events enable row level security;
