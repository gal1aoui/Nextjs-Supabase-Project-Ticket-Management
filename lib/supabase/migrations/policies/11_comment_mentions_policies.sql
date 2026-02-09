-- ============================================
-- RLS Policies: comment_mentions
-- ============================================

ALTER TABLE comment_mentions ENABLE ROW LEVEL SECURITY;

-- SELECT: Project members can view mentions
CREATE POLICY "Project members can view comment mentions"
  ON comment_mentions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ticket_comments tc
      JOIN tickets t ON t.id = tc.ticket_id
      WHERE tc.id = comment_mentions.comment_id
        AND is_project_member(t.project_id, (SELECT auth.uid()))
    )
  );

-- INSERT: Users who can create comments can create mentions
CREATE POLICY "Comment authors can create mentions"
  ON comment_mentions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ticket_comments tc
      WHERE tc.id = comment_mentions.comment_id
        AND tc.user_id = (SELECT auth.uid())
    )
  );

-- DELETE: Comment author or manage_tickets permission
CREATE POLICY "Comment authors or managers can delete mentions"
  ON comment_mentions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ticket_comments tc
      WHERE tc.id = comment_mentions.comment_id
        AND tc.user_id = (SELECT auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM ticket_comments tc
      JOIN tickets t ON t.id = tc.ticket_id
      WHERE tc.id = comment_mentions.comment_id
        AND has_project_permission(t.project_id, (SELECT auth.uid()), 'manage_tickets')
    )
  );
