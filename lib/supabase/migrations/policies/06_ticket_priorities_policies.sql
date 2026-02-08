-- ===========================================
-- Ticket Priorities Policies
-- ===========================================
-- RLS policies for the ticket_priorities table

-- SELECT: Project members can view priorities; anyone can view default templates
create policy "Members can view ticket priorities"
  on ticket_priorities for select
  to authenticated
  using (
    project_id is null
    or is_project_member(project_id, (select auth.uid()))
  );

-- INSERT: Users with manage_priorities permission
create policy "Managers can create ticket priorities"
  on ticket_priorities for insert
  to authenticated
  with check (has_project_permission(project_id, (select auth.uid()), 'manage_priorities'));

-- UPDATE: Users with manage_priorities permission
create policy "Managers can update ticket priorities"
  on ticket_priorities for update
  to authenticated
  using (has_project_permission(project_id, (select auth.uid()), 'manage_priorities'));

-- DELETE: Users with manage_priorities permission
create policy "Managers can delete ticket priorities"
  on ticket_priorities for delete
  to authenticated
  using (has_project_permission(project_id, (select auth.uid()), 'manage_priorities'));
