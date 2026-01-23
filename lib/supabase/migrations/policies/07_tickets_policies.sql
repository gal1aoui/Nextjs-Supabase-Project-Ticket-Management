-- ===========================================
-- Tickets Policies
-- ===========================================
-- RLS policies for the tickets table

-- SELECT: Project members can view tickets
create policy "Members can view tickets"
  on tickets for select
  to authenticated
  using (is_project_member(project_id, (select auth.uid())));

-- INSERT: Members with create_tickets or manage_tickets permission
create policy "Members can create tickets"
  on tickets for insert
  to authenticated
  with check (
    is_project_member(project_id, (select auth.uid()))
    and (
      has_project_permission(project_id, (select auth.uid()), 'create_tickets')
      or has_project_permission(project_id, (select auth.uid()), 'manage_tickets')
    )
  );

-- UPDATE: Based on permission level
-- - manage_tickets: Can update any ticket
-- - update_tickets: Can update any ticket
-- - update_own_tickets: Can only update tickets they created
create policy "Members can update tickets"
  on tickets for update
  to authenticated
  using (
    is_project_member(project_id, (select auth.uid()))
    and (
      has_project_permission(project_id, (select auth.uid()), 'manage_tickets')
      or has_project_permission(project_id, (select auth.uid()), 'update_tickets')
      or (
        has_project_permission(project_id, (select auth.uid()), 'update_own_tickets')
        and created_by = (select auth.uid())
      )
    )
  );

-- DELETE: Only users with manage_tickets permission
create policy "Project managers can delete tickets"
  on tickets for delete
  to authenticated
  using (has_project_permission(project_id, (select auth.uid()), 'manage_tickets'));
