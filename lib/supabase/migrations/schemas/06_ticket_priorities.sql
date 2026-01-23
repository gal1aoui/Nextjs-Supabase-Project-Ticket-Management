-- ===========================================
-- Ticket Priorities Schema
-- ===========================================
-- Priority levels for tickets (e.g., Low, Medium, High, Urgent)

create table ticket_priorities (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  project_id uuid references projects(id) on delete cascade,
  "order" integer not null default 0,
  color text,
  created_at timestamptz default now(),
  unique(project_id, name)
);

-- Indexes
create index idx_ticket_priorities_project on ticket_priorities(project_id);
create index idx_ticket_priorities_order on ticket_priorities(project_id, "order");

-- Enable RLS
alter table ticket_priorities enable row level security;
