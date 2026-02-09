-- ============================================
-- Table: project_repositories
-- Purpose: Link projects to GitHub/GitLab repos via PAT
-- ============================================

CREATE TABLE project_repositories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('github', 'gitlab')),
  repo_url TEXT NOT NULL,
  repo_owner TEXT NOT NULL,
  repo_name TEXT NOT NULL,
  access_token TEXT NOT NULL,
  connected_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  connected_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id)
);

-- Indexes
CREATE INDEX idx_project_repos_project ON project_repositories(project_id);
