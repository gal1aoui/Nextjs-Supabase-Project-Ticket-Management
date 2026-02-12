import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { RepoStats } from "@/types/repository";

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
    const stats = await fetchStats(
      repo.provider,
      repo.repo_owner,
      repo.repo_name,
      repo.access_token
    );

    return NextResponse.json(stats);
  } catch (_err) {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}

async function fetchStats(
  provider: string,
  owner: string,
  name: string,
  token: string
): Promise<RepoStats> {
  if (provider === "github") {
    return fetchGitHubStats(owner, name, token);
  }

  if (provider === "gitlab") {
    return fetchGitLabStats(owner, name, token);
  }

  return {
    total_commits: 0,
    total_branches: 0,
    stars: 0,
    forks: 0,
    languages: {},
    top_contributors: [],
  };
}

async function fetchGitHubStats(
  owner: string,
  name: string,
  token: string
): Promise<RepoStats> {
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github.v3+json",
  };

  const [repoRes, languagesRes, contributorsRes, branchesRes] = await Promise.all([
    fetch(`https://api.github.com/repos/${owner}/${name}`, { headers }),
    fetch(`https://api.github.com/repos/${owner}/${name}/languages`, { headers }),
    fetch(`https://api.github.com/repos/${owner}/${name}/contributors?per_page=5`, { headers }),
    fetch(`https://api.github.com/repos/${owner}/${name}/branches?per_page=1`, { headers }),
  ]);

  const repoData = repoRes.ok ? await repoRes.json() : {};
  const languagesData = languagesRes.ok ? await languagesRes.json() : {};
  const contributorsData = contributorsRes.ok ? await contributorsRes.json() : [];

  // Get total branches from Link header
  const branchLinkHeader = branchesRes.headers.get("Link");
  let totalBranches = 1;
  if (branchLinkHeader) {
    const lastMatch = branchLinkHeader.match(/page=(\d+)>; rel="last"/);
    if (lastMatch) totalBranches = Number.parseInt(lastMatch[1], 10);
  } else if (branchesRes.ok) {
    const branchData = await branchesRes.json();
    totalBranches = branchData.length;
  }

  // Convert language bytes to percentages
  const totalBytes = Object.values(languagesData as Record<string, number>).reduce(
    (sum: number, bytes: number) => sum + bytes,
    0
  );
  const languages: Record<string, number> = {};
  for (const [lang, bytes] of Object.entries(languagesData as Record<string, number>)) {
    languages[lang] = Math.round((bytes / totalBytes) * 1000) / 10;
  }

  // biome-ignore lint/suspicious/noExplicitAny: external API response
  const top_contributors = (Array.isArray(contributorsData) ? contributorsData : []).map((c: any) => ({
    name: c.login,
    email: "",
    avatar_url: c.avatar_url,
    commits: c.contributions,
  }));

  // Get total commits from contributors
  // biome-ignore lint/suspicious/noExplicitAny: external API response
  const total_commits = (Array.isArray(contributorsData) ? contributorsData : []).reduce(
    (sum: number, c: any) => sum + (c.contributions || 0),
    0
  );

  return {
    total_commits,
    total_branches: totalBranches,
    stars: repoData.stargazers_count || 0,
    forks: repoData.forks_count || 0,
    languages,
    top_contributors,
  };
}

async function fetchGitLabStats(
  owner: string,
  name: string,
  token: string
): Promise<RepoStats> {
  const encoded = encodeURIComponent(`${owner}/${name}`);
  const headers = { "PRIVATE-TOKEN": token };

  const [repoRes, languagesRes, contributorsRes, branchesRes] = await Promise.all([
    fetch(`https://gitlab.com/api/v4/projects/${encoded}`, { headers }),
    fetch(`https://gitlab.com/api/v4/projects/${encoded}/languages`, { headers }),
    fetch(
      `https://gitlab.com/api/v4/projects/${encoded}/repository/contributors?per_page=5&order_by=commits&sort=desc`,
      { headers }
    ),
    fetch(`https://gitlab.com/api/v4/projects/${encoded}/repository/branches?per_page=1`, {
      headers,
    }),
  ]);

  const repoData = repoRes.ok ? await repoRes.json() : {};
  const languagesData = languagesRes.ok ? await languagesRes.json() : {};
  const contributorsData = contributorsRes.ok ? await contributorsRes.json() : [];

  // Get total branches from header
  const totalBranchesHeader = branchesRes.headers.get("X-Total");
  const totalBranches = totalBranchesHeader ? Number.parseInt(totalBranchesHeader, 10) : 0;

  // GitLab already returns percentages
  const languages: Record<string, number> = {};
  for (const [lang, pct] of Object.entries(languagesData as Record<string, number>)) {
    languages[lang] = Math.round(pct * 10) / 10;
  }

  // biome-ignore lint/suspicious/noExplicitAny: external API response
  const top_contributors = (Array.isArray(contributorsData) ? contributorsData : []).map((c: any) => ({
    name: c.name,
    email: c.email || "",
    avatar_url: undefined,
    commits: c.commits,
  }));

  // biome-ignore lint/suspicious/noExplicitAny: external API response
  const total_commits = (Array.isArray(contributorsData) ? contributorsData : []).reduce(
    (sum: number, c: any) => sum + (c.commits || 0),
    0
  );

  return {
    total_commits,
    total_branches: totalBranches,
    stars: repoData.star_count || 0,
    forks: repoData.forks_count || 0,
    languages,
    top_contributors,
  };
}
