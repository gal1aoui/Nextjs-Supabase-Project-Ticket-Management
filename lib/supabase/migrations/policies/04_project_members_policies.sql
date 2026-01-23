-- ===========================================
-- Project Members Policies
-- ===========================================
-- RLS policies for the project_members table

-- SELECT: Members can view their project's members, or their own invitations
create policy "Members can view their project members"
  on project_members for select
  to authenticated
  using (
    is_project_member(project_id, (select auth.uid()))
    or user_id = (select auth.uid())
  );

-- INSERT: Users with manage_members permission can invite
create policy "Project admins can invite members"
  on project_members for insert
  to authenticated
  with check (
    has_project_permission(project_id, (select auth.uid()), 'manage_members')
  );

-- UPDATE: Admins can update members, users can update their own status (accept/decline)
create policy "Project admins can update members"
  on project_members for update
  to authenticated
  using (
    has_project_permission(project_id, (select auth.uid()), 'manage_members')
    or user_id = (select auth.uid())
  );

-- DELETE: Users with manage_members permission can remove members
create policy "Project admins can remove members"
  on project_members for delete
  to authenticated
  using (
    has_project_permission(project_id, (select auth.uid()), 'manage_members')
  );
