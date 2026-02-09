import type { GitBranch, GitCommit, RepositoryConnect } from "@/types/repository";

type RepoInfo = {
  id: string;
  project_id: string;
  provider: string;
  repo_url: string;
  repo_owner: string;
  repo_name: string;
  connected_by: string | null;
  connected_at: string;
};

export const repositoryService = {
  async getByProject(projectId: string): Promise<RepoInfo | null> {
    const res = await fetch(`/api/git/${projectId}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to fetch repository");
    }
    return res.json();
  },

  async connect(data: RepositoryConnect): Promise<RepoInfo> {
    const res = await fetch(`/api/git/${data.project_id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider: data.provider,
        repo_url: data.repo_url,
        access_token: data.access_token,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to connect repository");
    }

    return res.json();
  },

  async disconnect(projectId: string): Promise<void> {
    const res = await fetch(`/api/git/${projectId}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to disconnect repository");
    }
  },

  async getCommits(
    projectId: string,
    branch?: string,
    page = 1,
    perPage = 30
  ): Promise<GitCommit[]> {
    const params = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
    });
    if (branch) params.set("branch", branch);

    const res = await fetch(`/api/git/${projectId}/commits?${params}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to fetch commits");
    }

    return res.json();
  },

  async getBranches(projectId: string): Promise<GitBranch[]> {
    const res = await fetch(`/api/git/${projectId}/branches`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to fetch branches");
    }

    return res.json();
  },
};
