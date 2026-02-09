-- ============================================
-- RLS Policies: project_repositories
-- ============================================

ALTER TABLE project_repositories ENABLE ROW LEVEL SECURITY;

-- SELECT: Project members can view repo info
CREATE POLICY "Project members can view repositories"
  ON project_repositories
  FOR SELECT
  TO authenticated
  USING (is_project_member(project_id, (SELECT auth.uid())));

-- INSERT: Users with manage_project permission
CREATE POLICY "Project managers can connect repositories"
  ON project_repositories
  FOR INSERT
  TO authenticated
  WITH CHECK (
    has_project_permission(project_id, (SELECT auth.uid()), 'manage_project')
  );

-- UPDATE: Users with manage_project permission
CREATE POLICY "Project managers can update repositories"
  ON project_repositories
  FOR UPDATE
  TO authenticated
  USING (has_project_permission(project_id, (SELECT auth.uid()), 'manage_project'))
  WITH CHECK (has_project_permission(project_id, (SELECT auth.uid()), 'manage_project'));

-- DELETE: Users with manage_project permission
CREATE POLICY "Project managers can disconnect repositories"
  ON project_repositories
  FOR DELETE
  TO authenticated
  USING (has_project_permission(project_id, (SELECT auth.uid()), 'manage_project'));
