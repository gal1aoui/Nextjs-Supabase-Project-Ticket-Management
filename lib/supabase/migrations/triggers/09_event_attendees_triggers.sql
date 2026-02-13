-- ===========================================
-- Trigger: Auto-add event creator as attendee
-- ===========================================
create or replace function add_event_creator_as_attendee()
returns trigger as $$
begin
  insert into event_attendees (event_id, user_id, status)
  values (new.id, new.created_by, 'accepted');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_event_created
  after insert on events
  for each row execute procedure add_event_creator_as_attendee();
