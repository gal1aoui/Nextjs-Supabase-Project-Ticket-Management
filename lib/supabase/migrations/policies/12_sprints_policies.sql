-- ============================================
-- RLS Policies: sprints
-- ============================================

ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;

-- SELECT: Project members can view sprints
CREATE POLICY "Project members can view sprints"
  ON sprints
  FOR SELECT
  TO authenticated
  USING (is_project_member(project_id, (SELECT auth.uid())));

-- INSERT: Users with manage_sprints permission
CREATE POLICY "Users with manage_sprints can create sprints"
  ON sprints
  FOR INSERT
  TO authenticated
  WITH CHECK (
    has_project_permission(project_id, (SELECT auth.uid()), 'manage_sprints')
  );

-- UPDATE: Users with manage_sprints permission
CREATE POLICY "Users with manage_sprints can update sprints"
  ON sprints
  FOR UPDATE
  TO authenticated
  USING (has_project_permission(project_id, (SELECT auth.uid()), 'manage_sprints'))
  WITH CHECK (has_project_permission(project_id, (SELECT auth.uid()), 'manage_sprints'));

-- DELETE: Users with manage_sprints permission
CREATE POLICY "Users with manage_sprints can delete sprints"
  ON sprints
  FOR DELETE
  TO authenticated
  USING (has_project_permission(project_id, (SELECT auth.uid()), 'manage_sprints'));
