-- ===========================================
-- Ticket Priorities Policies
-- ===========================================
-- RLS policies for the ticket_priorities table
-- Template priorities (project_id IS NULL) are read-only defaults

-- SELECT: Project members can view priorities; anyone can view default templates
create policy "Members can view ticket priorities"
  on ticket_priorities for select
  to authenticated
  using (
    project_id is null
    or is_project_member(project_id, (select auth.uid()))
  );

-- INSERT: Users with manage_priorities permission (only project-scoped, not templates)
create policy "Managers can create ticket priorities"
  on ticket_priorities for insert
  to authenticated
  with check (
    project_id is not null
    and has_project_permission(project_id, (select auth.uid()), 'manage_priorities')
  );

-- UPDATE: Users with manage_priorities permission (only project-scoped, not templates)
create policy "Managers can update ticket priorities"
  on ticket_priorities for update
  to authenticated
  using (
    project_id is not null
    and has_project_permission(project_id, (select auth.uid()), 'manage_priorities')
  )
  with check (
    project_id is not null
  );

-- DELETE: Users with manage_priorities permission (only project-scoped, not templates)
create policy "Managers can delete ticket priorities"
  on ticket_priorities for delete
  to authenticated
  using (
    project_id is not null
    and has_project_permission(project_id, (select auth.uid()), 'manage_priorities')
  );
