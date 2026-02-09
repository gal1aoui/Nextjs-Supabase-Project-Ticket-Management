-- ============================================
-- RLS Policies: ticket_comments
-- ============================================

ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;

-- SELECT: Project members can view comments on tickets in their projects
CREATE POLICY "Project members can view ticket comments"
  ON ticket_comments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tickets t
      WHERE t.id = ticket_comments.ticket_id
        AND is_project_member(t.project_id, (SELECT auth.uid()))
    )
  );

-- INSERT: Users with 'comment' permission can create comments
CREATE POLICY "Users with comment permission can create comments"
  ON ticket_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    AND EXISTS (
      SELECT 1 FROM tickets t
      WHERE t.id = ticket_comments.ticket_id
        AND (
          has_project_permission(t.project_id, (SELECT auth.uid()), 'comment')
          OR has_project_permission(t.project_id, (SELECT auth.uid()), 'manage_tickets')
        )
    )
  );

-- UPDATE: Only comment author can edit their own comments
CREATE POLICY "Users can update own comments"
  ON ticket_comments
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- DELETE: Comment author OR users with manage_tickets permission
CREATE POLICY "Users can delete own comments or manage_tickets"
  ON ticket_comments
  FOR DELETE
  TO authenticated
  USING (
    (SELECT auth.uid()) = user_id
    OR EXISTS (
      SELECT 1 FROM tickets t
      WHERE t.id = ticket_comments.ticket_id
        AND has_project_permission(t.project_id, (SELECT auth.uid()), 'manage_tickets')
    )
  );
