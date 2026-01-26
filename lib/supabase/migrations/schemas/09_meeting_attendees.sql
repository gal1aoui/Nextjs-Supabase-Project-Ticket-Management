-- ===========================================
-- Meeting Attendees Schema
-- ===========================================
-- Links users to meetings with attendance status

create table meeting_attendees (
  id uuid primary key default uuid_generate_v4(),
  meeting_id uuid references meetings(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  status text default 'invited' check (status in ('invited', 'accepted', 'declined', 'tentative')),
  created_at timestamptz default now(),
  unique(meeting_id, user_id)
);

-- Indexes
create index idx_meeting_attendees_meeting on meeting_attendees(meeting_id);
create index idx_meeting_attendees_user on meeting_attendees(profile_id);
create index idx_meeting_attendees_status on meeting_attendees(status);

-- Enable RLS
alter table meeting_attendees enable row level security;

-- ===========================================
-- Trigger: Auto-add meeting creator as attendee
-- ===========================================
create or replace function add_meeting_creator_as_attendee()
returns trigger as $$
begin
  insert into meeting_attendees (meeting_id, profile_id, status)
  values (new.id, new.created_by, 'accepted');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_meeting_created
  after insert on meetings
  for each row execute procedure add_meeting_creator_as_attendee();
