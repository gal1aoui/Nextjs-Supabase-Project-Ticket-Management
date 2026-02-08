-- ===========================================
-- Ticket States Policies
-- ===========================================
-- RLS policies for the ticket_states table

-- SELECT: Project members can view states; anyone can view default templates
create policy "Members can view ticket states"
  on ticket_states for select
  to authenticated
  using (
    project_id is null
    or is_project_member(project_id, (select auth.uid()))
  );

-- INSERT: Users with manage_states permission
create policy "Managers can create ticket states"
  on ticket_states for insert
  to authenticated
  with check (has_project_permission(project_id, (select auth.uid()), 'manage_states'));

-- UPDATE: Users with manage_states permission
create policy "Managers can update ticket states"
  on ticket_states for update
  to authenticated
  using (has_project_permission(project_id, (select auth.uid()), 'manage_states'));

-- DELETE: Users with manage_states permission
create policy "Managers can delete ticket states"
  on ticket_states for delete
  to authenticated
  using (has_project_permission(project_id, (select auth.uid()), 'manage_states'));
