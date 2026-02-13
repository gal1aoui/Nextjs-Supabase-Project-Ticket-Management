-- ===========================================
-- Event Attendees Schema
-- ===========================================
-- Links users to events with attendance status

create table event_attendees (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  status text default 'invited' check (status in ('invited', 'accepted', 'declined', 'tentative')),
  created_at timestamptz default now(),
  unique(event_id, user_id)
);

-- Indexes
create index idx_event_attendees_event on event_attendees(event_id);
create index idx_event_attendees_user on event_attendees(user_id);
create index idx_event_attendees_status on event_attendees(status);

-- Enable RLS
alter table event_attendees enable row level security;

