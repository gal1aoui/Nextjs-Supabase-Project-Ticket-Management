-- ===========================================
-- Meetings Policies
-- ===========================================
-- RLS policies for the meetings table

-- SELECT: Project members can view meetings
create policy "Project members can view meetings"
  on meetings for select
  to authenticated
  using (is_project_member(project_id, (select auth.uid())));

-- INSERT: Members with manage_meetings permission
create policy "Project members can create meetings"
  on meetings for insert
  to authenticated
  with check (
    is_project_member(project_id, (select auth.uid()))
    and has_project_permission(project_id, (select auth.uid()), 'manage_meetings')
  );

-- UPDATE: Meeting creator or users with manage_meetings permission
create policy "Meeting creators can update meetings"
  on meetings for update
  to authenticated
  using (
    created_by = (select auth.uid())
    or has_project_permission(project_id, (select auth.uid()), 'manage_meetings')
  );

-- DELETE: Meeting creator or users with manage_meetings permission
create policy "Meeting creators can delete meetings"
  on meetings for delete
  to authenticated
  using (
    created_by = (select auth.uid())
    or has_project_permission(project_id, (select auth.uid()), 'manage_meetings')
  );
