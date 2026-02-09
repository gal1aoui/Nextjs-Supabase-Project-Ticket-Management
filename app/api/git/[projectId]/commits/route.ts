import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { GitCommit } from "@/types/repository";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const supabase = await createClient();

  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get repo with token
  const { data: repo, error } = await supabase
    .from("project_repositories")
    .select("*")
    .eq("project_id", projectId)
    .single();

  if (error || !repo) {
    return NextResponse.json({ error: "Repository not found" }, { status: 404 });
  }

  const url = new URL(request.url);
  const branch = url.searchParams.get("branch") || undefined;
  const page = Number.parseInt(url.searchParams.get("page") || "1");
  const perPage = Number.parseInt(url.searchParams.get("per_page") || "30");

  try {
    const commits = await fetchCommits(repo.provider, repo.repo_owner, repo.repo_name, repo.access_token, {
      branch,
      page,
      perPage,
    });

    return NextResponse.json(commits);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch commits" },
      { status: 500 }
    );
  }
}

async function fetchCommits(
  provider: string,
  owner: string,
  name: string,
  token: string,
  opts: { branch?: string; page: number; perPage: number }
): Promise<GitCommit[]> {
  if (provider === "github") {
    const params = new URLSearchParams({
      per_page: String(opts.perPage),
      page: String(opts.page),
    });
    if (opts.branch) params.set("sha", opts.branch);

    const res = await fetch(
      `https://api.github.com/repos/${owner}/${name}/commits?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

    const data = await res.json();
    return data.map((c: Record<string, unknown>) => normalizeGitHubCommit(c));
  }

  if (provider === "gitlab") {
    const encoded = encodeURIComponent(`${owner}/${name}`);
    const params = new URLSearchParams({
      per_page: String(opts.perPage),
      page: String(opts.page),
    });
    if (opts.branch) params.set("ref_name", opts.branch);

    const res = await fetch(
      `https://gitlab.com/api/v4/projects/${encoded}/repository/commits?${params}`,
      { headers: { "PRIVATE-TOKEN": token } }
    );

    if (!res.ok) throw new Error(`GitLab API error: ${res.status}`);

    const data = await res.json();
    return data.map((c: Record<string, unknown>) => normalizeGitLabCommit(c));
  }

  return [];
}

// biome-ignore lint/suspicious/noExplicitAny: external API response
function normalizeGitHubCommit(c: any): GitCommit {
  return {
    sha: c.sha,
    message: c.commit.message,
    author: {
      name: c.commit.author.name,
      email: c.commit.author.email,
      date: c.commit.author.date,
      avatar_url: c.author?.avatar_url,
    },
    parents: (c.parents || []).map((p: { sha: string }) => ({ sha: p.sha })),
  };
}

// biome-ignore lint/suspicious/noExplicitAny: external API response
function normalizeGitLabCommit(c: any): GitCommit {
  return {
    sha: c.id,
    message: c.message,
    author: {
      name: c.author_name,
      email: c.author_email,
      date: c.authored_date,
      avatar_url: undefined,
    },
    parents: (c.parent_ids || []).map((id: string) => ({ sha: id })),
  };
}
