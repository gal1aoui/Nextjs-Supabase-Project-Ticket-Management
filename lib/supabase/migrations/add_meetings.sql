-- Meetings table
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

-- Meeting attendees (links meetings to project members)
create table meeting_attendees (
  id uuid primary key default uuid_generate_v4(),
  meeting_id uuid references meetings(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  status text default 'invited' check (status in ('invited', 'accepted', 'declined', 'tentative')),
  created_at timestamptz default now(),
  unique(meeting_id, user_id)
);

-- Indexes
create index idx_meetings_project on meetings(project_id);
create index idx_meetings_start_time on meetings(start_time);
create index idx_meetings_created_by on meetings(created_by);
create index idx_meeting_attendees_meeting on meeting_attendees(meeting_id);
create index idx_meeting_attendees_user on meeting_attendees(user_id);
create index idx_meeting_attendees_status on meeting_attendees(status);

-- RLS Policies
alter table meetings enable row level security;
alter table meeting_attendees enable row level security;

-- Meetings policies
create policy "Project members can view meetings" on meetings
  for select using (is_project_member(project_id, auth.uid()));

create policy "Project members can create meetings" on meetings
  for insert with check (
    is_project_member(project_id, auth.uid()) and
    (has_project_permission(project_id, auth.uid(), 'manage_tickets') or
     has_project_permission(project_id, auth.uid(), 'create_tickets'))
  );

create policy "Meeting creators can update meetings" on meetings
  for update using (
    created_by = auth.uid() or
    has_project_permission(project_id, auth.uid(), 'manage_tickets')
  );

create policy "Meeting creators can delete meetings" on meetings
  for delete using (
    created_by = auth.uid() or
    has_project_permission(project_id, auth.uid(), 'manage_tickets')
  );

-- Meeting attendees policies
create policy "Users can view meeting attendees" on meeting_attendees
  for select using (
    exists (
      select 1 from meetings m
      where m.id = meeting_attendees.meeting_id
      and is_project_member(m.project_id, auth.uid())
    )
  );

create policy "Meeting creators can manage attendees" on meeting_attendees
  for all using (
    exists (
      select 1 from meetings m
      where m.id = meeting_attendees.meeting_id
      and (m.created_by = auth.uid() or has_project_permission(m.project_id, auth.uid(), 'manage_tickets'))
    )
  );

-- Function to auto-add creator as attendee
create or replace function add_meeting_creator_as_attendee()
returns trigger as $$
begin
  insert into meeting_attendees (meeting_id, user_id, status)
  values (new.id, new.created_by, 'accepted');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_meeting_created
  after insert on meetings
  for each row execute procedure add_meeting_creator_as_attendee();