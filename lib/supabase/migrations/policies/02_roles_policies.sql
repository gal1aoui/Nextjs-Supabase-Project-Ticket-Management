-- ===========================================
-- Roles Policies
-- ===========================================
-- RLS policies for the roles table
-- System roles (is_system=true) are read-only for everyone
-- Custom roles (is_system=false) are scoped to a project

-- SELECT: Authenticated users can view system roles and their project's custom roles
create policy "Roles are viewable by authenticated users"
  on roles for select
  to authenticated
  using (
    is_system = true
    or project_id is null
    or is_project_member(project_id, (select auth.uid()))
  );

-- INSERT: Users with manage_roles permission can create custom roles for their project
create policy "Members with manage_roles can create custom roles"
  on roles for insert
  to authenticated
  with check (
    is_system = false
    and project_id is not null
    and has_project_permission(project_id, (select auth.uid()), 'manage_roles')
  );

-- UPDATE: Users with manage_roles permission can update custom roles (not system roles)
create policy "Members with manage_roles can update custom roles"
  on roles for update
  to authenticated
  using (
    is_system = false
    and project_id is not null
    and has_project_permission(project_id, (select auth.uid()), 'manage_roles')
  )
  with check (
    is_system = false
    and project_id is not null
  );

-- DELETE: Users with manage_roles permission can delete custom roles (not system roles)
create policy "Members with manage_roles can delete custom roles"
  on roles for delete
  to authenticated
  using (
    is_system = false
    and project_id is not null
    and has_project_permission(project_id, (select auth.uid()), 'manage_roles')
  );
