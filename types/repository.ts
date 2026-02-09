import { z } from "zod";

// ===========================================
// Database Types
// ===========================================

export type GitProvider = "github" | "gitlab";

export type ProjectRepository = {
  id: string;
  project_id: string;
  provider: GitProvider;
  repo_url: string;
  repo_owner: string;
  repo_name: string;
  access_token: string;
  connected_by: string | null;
  connected_at: string;
};

// ===========================================
// Form Schemas
// ===========================================

export const repositoryConnectSchema = z.object({
  project_id: z.uuid(),
  provider: z.enum(["github", "gitlab"]),
  repo_url: z.string().url("Please enter a valid URL"),
  access_token: z.string().min(1, "Access token is required"),
});

export type RepositoryConnect = z.infer<typeof repositoryConnectSchema>;

// ===========================================
// Git API Response Types
// ===========================================

export type GitCommit = {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
    date: string;
    avatar_url?: string;
  };
  parents: { sha: string }[];
};

export type GitBranch = {
  name: string;
  commit_sha: string;
  is_default: boolean;
  is_protected: boolean;
};
