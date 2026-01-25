-- ===========================================
-- Tickets Schema
-- ===========================================
-- Main ticket/task entity

create table tickets (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  project_id uuid references projects(id) on delete cascade,
  state_id uuid references ticket_states(id) on delete restrict,
  assigned_to uuid references auth.users(id) on delete set null,
  priority_id uuid references ticket_priorities(id) on delete set null,
  sort_order integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid references auth.users(id) on delete set null
);

-- Indexes
create index idx_tickets_project on tickets(project_id);
create index idx_tickets_state on tickets(state_id);
create index idx_tickets_assigned on tickets(assigned_to);
create index idx_tickets_priority on tickets(priority_id);
create index idx_tickets_created_by on tickets(created_by);
create index idx_tickets_updated_at on tickets(updated_at desc);
create index idx_tickets_state_sort on tickets(state_id, sort_order);

-- Enable RLS
alter table tickets enable row level security;
