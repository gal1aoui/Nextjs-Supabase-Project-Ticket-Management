-- ============================================
-- Table: comment_mentions
-- Purpose: Track @mentions in ticket comments
-- ============================================

CREATE TABLE comment_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES ticket_comments(id) ON DELETE CASCADE,
  mentioned_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(comment_id, mentioned_user_id)
);

-- Indexes
CREATE INDEX idx_comment_mentions_comment ON comment_mentions(comment_id);
CREATE INDEX idx_comment_mentions_user ON comment_mentions(mentioned_user_id);
