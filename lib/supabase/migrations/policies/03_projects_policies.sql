-- ===========================================
-- Projects Policies
-- ===========================================
-- RLS policies for the projects table

-- SELECT: Users can view projects they created or are members of
create policy "Users can view projects they are members of"
  on projects for select
  to authenticated
  using (
    (select auth.uid()) = created_by
    or is_project_member(id, (select auth.uid()))
  );

-- INSERT: Authenticated users can create projects
create policy "Users can create projects"
  on projects for insert
  to authenticated
  with check ((select auth.uid()) = created_by);

-- UPDATE: Project owners or users with manage_project permission
create policy "Project owners/admins can update projects"
  on projects for update
  to authenticated
  using (
    (select auth.uid()) = created_by
    or has_project_permission(id, (select auth.uid()), 'manage_project')
  );

-- DELETE: Only project owners can delete projects
create policy "Project owners can delete projects"
  on projects for delete
  to authenticated
  using ((select auth.uid()) = created_by);
