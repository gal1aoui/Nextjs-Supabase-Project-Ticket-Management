-- ===========================================
-- Trigger: Auto-add project creator as owner
-- ===========================================
create or replace function add_project_creator_as_owner()
returns trigger as $$
declare
  owner_role_id uuid;
begin
  select id into owner_role_id from roles where name = 'Owner' limit 1;

  insert into project_members (project_id, user_id, role_id, status, joined_at)
  values (new.id, new.created_by, owner_role_id, 'active', now());

  return new;
end;
$$ language plpgsql security definer;

create trigger on_project_created
  after insert on projects
  for each row execute procedure add_project_creator_as_owner();
