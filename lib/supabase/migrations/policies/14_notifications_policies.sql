-- ============================================
-- RLS Policies: notifications
-- ============================================

-- Users can only view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Users can update (mark as read) their own notifications
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Project members can view all notifications for their projects (project history)
CREATE POLICY "Project members can view project notifications"
  ON notifications FOR SELECT TO authenticated
  USING (
    metadata->>'project_id' IS NOT NULL
    AND is_project_member(
      (metadata->>'project_id')::uuid,
      (SELECT auth.uid())
    )
  );

-- Triggers (security definer) insert notifications; allow all authenticated inserts
-- The triggers run as SECURITY DEFINER so they bypass RLS, but we still need
-- a permissive policy for the realtime subscription filter to work
CREATE POLICY "Allow trigger inserts"
  ON notifications FOR INSERT TO authenticated
  WITH CHECK (true);
