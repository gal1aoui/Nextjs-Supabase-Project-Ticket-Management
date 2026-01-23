-- ===========================================
-- Ticket States Schema
-- ===========================================
-- Workflow states for tickets (e.g., To Do, In Progress, Done)

create table ticket_states (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  project_id uuid references projects(id) on delete cascade,
  "order" integer not null default 0,
  color text,
  created_at timestamptz default now(),
  unique(project_id, name)
);

-- Indexes
create index idx_ticket_states_project on ticket_states(project_id);
create index idx_ticket_states_order on ticket_states(project_id, "order");

-- Enable RLS
alter table ticket_states enable row level security;
