-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  email text unique,
  avatar_url text,
  website text,
  constraint username_length check (char_length(username) >= 3)
);

alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check ((select auth.uid()) = id);

create policy "Users can update own profile." on profiles
  for update using ((select auth.uid()) = id);

-- Trigger to create profile on user signup
create function public.handle_new_user()
returns trigger
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, email, username)
  values (new.id, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'avatar_url', new.email, new.raw_user_meta_data->>'username');
  return new;
end;

$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Storage setup
insert into storage.buckets (id, name)
  values ('avatars', 'avatars');

create policy "Avatar images are publicly accessible." on storage.objects
  for select using (bucket_id = 'avatars');

create policy "Anyone can upload an avatar." on storage.objects
  for insert with check (bucket_id = 'avatars');

-- Workspaces table
create table workspaces (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  slug text unique not null,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid references auth.users(id) on delete cascade
);

-- Roles table
create table roles (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  description text,
  permissions jsonb default '[]'::jsonb,
  is_system boolean default false,
  created_at timestamptz default now()
);

-- Insert default system roles
insert into roles (name, description, is_system, permissions) values
('Owner', 'Full workspace and project access', true, '["manage_workspace", "manage_projects", "manage_members", "manage_roles", "manage_tickets", "manage_states", "manage_priorities"]'::jsonb),
('Admin', 'Full project management access', true, '["manage_projects", "manage_members", "manage_roles", "manage_tickets", "manage_states", "manage_priorities"]'::jsonb),
('Manager', 'Can manage tickets and team members', true, '["manage_members", "manage_tickets", "manage_states", "manage_priorities"]'::jsonb),
('Product Owner', 'Defines requirements and priorities', true, '["manage_tickets", "manage_priorities", "view_reports"]'::jsonb),
('Scrum Master', 'Facilitates team and removes blockers', true, '["manage_tickets", "manage_states", "view_reports"]'::jsonb),
('Developer', 'Works on tickets and updates progress', true, '["create_tickets", "update_own_tickets", "comment"]'::jsonb),
('Tester', 'Tests and reports bugs', true, '["create_tickets", "update_tickets", "comment"]'::jsonb),
('Designer', 'Creates designs and assets', true, '["create_tickets", "update_own_tickets", "comment"]'::jsonb),
('Guest', 'View-only access', true, '["view_tickets"]'::jsonb);

-- Workspace members
create table workspace_members (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role_id uuid references roles(id) on delete restrict,
  invited_by uuid references auth.users(id) on delete set null,
  invited_at timestamptz default now(),
  joined_at timestamptz,
  status text default 'pending' check (status in ('pending', 'active', 'inactive')),
  unique(workspace_id, user_id)
);

-- Projects table
create table projects (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) on delete cascade not null,
  name text not null,
  description text,
  color text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid references auth.users(id) on delete cascade
);

-- Project members
create table project_members (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role_id uuid references roles(id) on delete restrict,
  invited_by uuid references auth.users(id) on delete set null,
  invited_at timestamptz default now(),
  joined_at timestamptz,
  status text default 'pending' check (status in ('pending', 'active', 'inactive')),
  unique(project_id, user_id)
);

-- Ticket states table
create table ticket_states (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  project_id uuid references projects(id) on delete cascade,
  "order" integer not null default 0,
  color text,
  created_at timestamptz default now(),
  unique(project_id, name)
);

-- Ticket priorities table
create table ticket_priorities (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  project_id uuid references projects(id) on delete cascade,
  "order" integer not null default 0,
  color text,
  created_at timestamptz default now(),
  unique(project_id, name)
);

-- Tickets table
create table tickets (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  project_id uuid references projects(id) on delete cascade,
  state_id uuid references ticket_states(id) on delete restrict,
  assigned_to uuid references auth.users(id) on delete set null,
  priority_id uuid references ticket_priorities(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid references auth.users(id) on delete set null
);

-- Indexes
create index idx_profiles_username on profiles(username);
create index idx_workspaces_slug on workspaces(slug);
create index idx_workspaces_created_by on workspaces(created_by);
create index idx_workspace_members_workspace on workspace_members(workspace_id);
create index idx_workspace_members_user on workspace_members(user_id);
create index idx_workspace_members_status on workspace_members(status);
create index idx_projects_workspace on projects(workspace_id);
create index idx_projects_created_by on projects(created_by);
create index idx_project_members_project on project_members(project_id);
create index idx_project_members_user on project_members(user_id);
create index idx_project_members_status on project_members(status);
create index idx_ticket_states_project on ticket_states(project_id);
create index idx_ticket_priorities_project on ticket_priorities(project_id);
create index idx_tickets_project on tickets(project_id);
create index idx_tickets_state on tickets(state_id);
create index idx_tickets_assigned on tickets(assigned_to);
create index idx_tickets_priority on tickets(priority_id);

-- Helper function to check if user is workspace member
create or replace function is_workspace_member(p_workspace_id uuid, p_user_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from workspace_members
    where workspace_id = p_workspace_id
    and user_id = p_user_id
    and status = 'active'
  );
end;
$$ language plpgsql security definer;

-- Helper function to check if user is project member
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

-- Helper function to check workspace permission
create or replace function has_workspace_permission(p_workspace_id uuid, p_user_id uuid, p_permission text)
returns boolean as $$
begin
  return exists (
    select 1 from workspace_members wm
    join roles r on r.id = wm.role_id
    where wm.workspace_id = p_workspace_id
    and wm.user_id = p_user_id
    and wm.status = 'active'
    and r.permissions @> to_jsonb(p_permission)
  );
end;
$$ language plpgsql security definer;

-- Helper function to check project permission
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

-- Helper to get user's workspace from project
create or replace function get_workspace_from_project(p_project_id uuid)
returns uuid as $$
declare
  v_workspace_id uuid;
begin
  select workspace_id into v_workspace_id
  from projects
  where id = p_project_id;
  return v_workspace_id;
end;
$$ language plpgsql security definer;

-- RLS Policies
alter table workspaces enable row level security;
alter table roles enable row level security;
alter table workspace_members enable row level security;
alter table projects enable row level security;
alter table project_members enable row level security;
alter table ticket_states enable row level security;
alter table ticket_priorities enable row level security;
alter table tickets enable row level security;

-- Roles policies
create policy "Roles are viewable by authenticated users" on roles
  for select using (auth.role() = 'authenticated');

-- Workspaces policies
create policy "Users can view workspaces they are members of" on workspaces
  for select using (
    auth.uid() = created_by or 
    is_workspace_member(id, auth.uid())
  );

create policy "Users can create workspaces" on workspaces
  for insert with check (auth.uid() = created_by);

create policy "Workspace owners can update workspaces" on workspaces
  for update using (
    auth.uid() = created_by or
    has_workspace_permission(id, auth.uid(), 'manage_workspace')
  );

create policy "Workspace owners can delete workspaces" on workspaces
  for delete using (auth.uid() = created_by);

-- Workspace members policies
create policy "Users can view members of their workspaces" on workspace_members
  for select using (is_workspace_member(workspace_id, auth.uid()));

create policy "Workspace admins can invite members" on workspace_members
  for insert with check (
    has_workspace_permission(workspace_id, auth.uid(), 'manage_members')
  );

create policy "Workspace admins can update members" on workspace_members
  for update using (
    has_workspace_permission(workspace_id, auth.uid(), 'manage_members')
  );

create policy "Workspace admins can remove members" on workspace_members
  for delete using (
    has_workspace_permission(workspace_id, auth.uid(), 'manage_members')
  );

-- Projects policies
create policy "Users can view projects in their workspaces" on projects
  for select using (
    is_workspace_member(workspace_id, auth.uid())
  );

create policy "Workspace members can create projects" on projects
  for insert with check (
    is_workspace_member(workspace_id, auth.uid()) and
    (has_workspace_permission(workspace_id, auth.uid(), 'manage_projects') or
     auth.uid() = created_by)
  );

create policy "Project admins can update projects" on projects
  for update using (
    has_workspace_permission(workspace_id, auth.uid(), 'manage_projects') or
    has_project_permission(id, auth.uid(), 'manage_project')
  );

create policy "Project admins can delete projects" on projects
  for delete using (
    has_workspace_permission(workspace_id, auth.uid(), 'manage_projects')
  );

-- Project members policies
create policy "Users can view members of their projects" on project_members
  for select using (is_project_member(project_id, auth.uid()));

create policy "Project admins can invite members" on project_members
  for insert with check (
    has_project_permission(project_id, auth.uid(), 'manage_members')
  );

create policy "Project admins can update members" on project_members
  for update using (
    has_project_permission(project_id, auth.uid(), 'manage_members')
  );

create policy "Project admins can remove members" on project_members
  for delete using (
    has_project_permission(project_id, auth.uid(), 'manage_members')
  );

-- Ticket states policies
create policy "Members can view ticket states" on ticket_states
  for select using (is_project_member(project_id, auth.uid()));

create policy "Managers can create ticket states" on ticket_states
  for insert with check (has_project_permission(project_id, auth.uid(), 'manage_states'));

create policy "Managers can update ticket states" on ticket_states
  for update using (has_project_permission(project_id, auth.uid(), 'manage_states'));

create policy "Managers can delete ticket states" on ticket_states
  for delete using (has_project_permission(project_id, auth.uid(), 'manage_states'));

-- Ticket priorities policies
create policy "Members can view ticket priorities" on ticket_priorities
  for select using (is_project_member(project_id, auth.uid()));

create policy "Managers can create ticket priorities" on ticket_priorities
  for insert with check (has_project_permission(project_id, auth.uid(), 'manage_priorities'));

create policy "Managers can update ticket priorities" on ticket_priorities
  for update using (has_project_permission(project_id, auth.uid(), 'manage_priorities'));

create policy "Managers can delete ticket priorities" on ticket_priorities
  for delete using (has_project_permission(project_id, auth.uid(), 'manage_priorities'));

-- Tickets policies
create policy "Members can view tickets" on tickets
  for select using (is_project_member(project_id, auth.uid()));

create policy "Members can create tickets" on tickets
  for insert with check (
    is_project_member(project_id, auth.uid()) and
    (has_project_permission(project_id, auth.uid(), 'create_tickets') or
     has_project_permission(project_id, auth.uid(), 'manage_tickets'))
  );

create policy "Members can update tickets" on tickets
  for update using (
    is_project_member(project_id, auth.uid()) and
    (has_project_permission(project_id, auth.uid(), 'manage_tickets') or
     (has_project_permission(project_id, auth.uid(), 'update_own_tickets') and created_by = auth.uid()) or
     has_project_permission(project_id, auth.uid(), 'update_tickets'))
  );

create policy "Project managers can delete tickets" on tickets
  for delete using (has_project_permission(project_id, auth.uid(), 'manage_tickets'));

-- Auto-add workspace creator as owner
create or replace function add_workspace_creator_as_owner()
returns trigger as $$
declare
  owner_role_id uuid;
begin
  select id into owner_role_id from roles where name = 'Owner' limit 1;
  
  insert into workspace_members (workspace_id, user_id, role_id, status, joined_at)
  values (new.id, new.created_by, owner_role_id, 'active', now());
  
  return new;
end;
$$ language plpgsql security definer;

create trigger on_workspace_created
  after insert on workspaces
  for each row execute procedure add_workspace_creator_as_owner();

-- Auto-add project creator as admin member
create or replace function add_project_creator_as_admin()
returns trigger as $$
declare
  admin_role_id uuid;
begin
  select id into admin_role_id from roles where name = 'Admin' limit 1;
  
  insert into project_members (project_id, user_id, role_id, status, joined_at)
  values (new.id, new.created_by, admin_role_id, 'active', now());
  
  return new;
end;
$$ language plpgsql security definer;

create trigger on_project_created
  after insert on projects
  for each row execute procedure add_project_creator_as_admin();