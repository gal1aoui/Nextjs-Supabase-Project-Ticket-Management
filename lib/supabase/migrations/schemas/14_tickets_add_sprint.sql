-- ============================================
-- Alter: tickets - add sprint_id
-- Purpose: Link tickets to sprints (NULL = backlog)
-- ============================================

ALTER TABLE tickets ADD COLUMN sprint_id UUID REFERENCES sprints(id) ON DELETE SET NULL;

CREATE INDEX idx_tickets_sprint ON tickets(sprint_id);
