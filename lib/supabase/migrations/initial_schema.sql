-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Projects table
create table projects (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  color text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid references auth.users(id) on delete cascade
);

-- Ticket states table
create table ticket_states (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  project_id uuid references projects(id) on delete cascade,
  "order" integer not null default 0,
  color text,
  created_at timestamptz default now()
);

-- Ticket priorities table
create table ticket_priorities (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  project_id uuid references projects(id) on delete cascade,
  "order" integer not null default 0,
  color text,
  created_at timestamptz default now()
);

-- Tickets table
create table tickets (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  project_id uuid references projects(id) on delete cascade,
  state_id uuid references ticket_states(id) on delete restrict,
  assigned_to uuid references auth.users(id) on delete restrict,
  priority_id uuid references ticket_priorities(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid references auth.users(id) on delete cascade
);

-- Indexes
create index idx_projects_created_by on projects(created_by);
create index idx_ticket_states_project on ticket_states(project_id);
create index idx_ticket_priorities_project on ticket_priorities(project_id);
create index idx_tickets_project on tickets(project_id);
create index idx_tickets_state on tickets(state_id);
create index idx_tickets_assigned on tickets(assigned_to);
create index idx_tickets_priority on tickets(priority_id);

-- RLS Policies
alter table projects enable row level security;
alter table ticket_states enable row level security;
alter table ticket_priorities enable row level security;
alter table tickets enable row level security;

-- Projects policies
create policy "Users can view projects" on projects for select using (auth.uid() = created_by);
create policy "Users can create projects" on projects for insert with check (auth.uid() = created_by);
create policy "Users can update own projects" on projects for update using (auth.uid() = created_by);
create policy "Users can delete own projects" on projects for delete using (auth.uid() = created_by);

-- Ticket states policies
create policy "Users can view states" on ticket_states for select using (
  exists (select 1 from projects where projects.id = ticket_states.project_id and projects.created_by = auth.uid())
);
create policy "Users can create states" on ticket_states for insert with check (
  exists (select 1 from projects where projects.id = ticket_states.project_id and projects.created_by = auth.uid())
);
create policy "Users can update states" on ticket_states for update using (
  exists (select 1 from projects where projects.id = ticket_states.project_id and projects.created_by = auth.uid())
);
create policy "Users can delete states" on ticket_states for delete using (
  exists (select 1 from projects where projects.id = ticket_states.project_id and projects.created_by = auth.uid())
);

-- Ticket priorities policies
create policy "Users can view priorities" on ticket_priorities for select using (
  exists (select 1 from projects where projects.id = ticket_priorities.project_id and projects.created_by = auth.uid())
);
create policy "Users can create priorities" on ticket_priorities for insert with check (
  exists (select 1 from projects where projects.id = ticket_priorities.project_id and projects.created_by = auth.uid())
);
create policy "Users can update priorities" on ticket_priorities for update using (
  exists (select 1 from projects where projects.id = ticket_priorities.project_id and projects.created_by = auth.uid())
);
create policy "Users can delete priorities" on ticket_priorities for delete using (
  exists (select 1 from projects where projects.id = ticket_priorities.project_id and projects.created_by = auth.uid())
);

-- Tickets policies
create policy "Users can view tickets" on tickets for select using (
  exists (select 1 from projects where projects.id = tickets.project_id and projects.created_by = auth.uid())
);
create policy "Users can create tickets" on tickets for insert with check (
  exists (select 1 from projects where projects.id = tickets.project_id and projects.created_by = auth.uid())
);
create policy "Users can update tickets" on tickets for update using (
  exists (select 1 from projects where projects.id = tickets.project_id and projects.created_by = auth.uid())
);
create policy "Users can delete tickets" on tickets for delete using (
  exists (select 1 from projects where projects.id = tickets.project_id and projects.created_by = auth.uid())
);