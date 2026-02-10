import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { GitBranch } from "@/types/repository";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const supabase = await createClient();

  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: repo, error } = await supabase
    .from("project_repositories")
    .select("*")
    .eq("project_id", projectId)
    .single();

  if (error || !repo) {
    return NextResponse.json({ error: "Repository not found" }, { status: 404 });
  }

  try {
    const branches = await fetchBranches(
      repo.provider,
      repo.repo_owner,
      repo.repo_name,
      repo.access_token
    );

    return NextResponse.json(branches);
  } catch (_err) {
    return NextResponse.json({ error: "Failed to fetch branches" }, { status: 500 });
  }
}

async function fetchBranches(
  provider: string,
  owner: string,
  name: string,
  token: string
): Promise<GitBranch[]> {
  if (provider === "github") {
    // Fetch branches + default branch info
    const [branchesRes, repoRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${owner}/${name}/branches?per_page=100`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }),
      fetch(`https://api.github.com/repos/${owner}/${name}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }),
    ]);

    if (!branchesRes.ok) throw new Error(`GitHub API error: ${branchesRes.status}`);

    const branches = await branchesRes.json();
    const repoData = repoRes.ok ? await repoRes.json() : {};
    const defaultBranch = repoData.default_branch || "main";

    // biome-ignore lint/suspicious/noExplicitAny: external API response
    return branches.map((b: any) => ({
      name: b.name,
      commit_sha: b.commit.sha,
      is_default: b.name === defaultBranch,
      is_protected: b.protected || false,
    }));
  }

  if (provider === "gitlab") {
    const encoded = encodeURIComponent(`${owner}/${name}`);

    const [branchesRes, repoRes] = await Promise.all([
      fetch(`https://gitlab.com/api/v4/projects/${encoded}/repository/branches?per_page=100`, {
        headers: { "PRIVATE-TOKEN": token },
      }),
      fetch(`https://gitlab.com/api/v4/projects/${encoded}`, {
        headers: { "PRIVATE-TOKEN": token },
      }),
    ]);

    if (!branchesRes.ok) throw new Error(`GitLab API error: ${branchesRes.status}`);

    const branches = await branchesRes.json();
    const repoData = repoRes.ok ? await repoRes.json() : {};
    const defaultBranch = repoData.default_branch || "main";

    // biome-ignore lint/suspicious/noExplicitAny: external API response
    return branches.map((b: any) => ({
      name: b.name,
      commit_sha: b.commit?.id || "",
      is_default: b.name === defaultBranch,
      is_protected: b.protected || false,
    }));
  }

  return [];
}
