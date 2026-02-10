import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: Get repo info for a project (without exposing PAT)
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

  const { data, error } = await supabase
    .from("project_repositories")
    .select("id, project_id, provider, repo_url, repo_owner, repo_name, connected_by, connected_at")
    .eq("project_id", projectId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json(null);
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

// POST: Connect a repository
export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const supabase = await createClient();

  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { provider, repo_url, access_token } = body;

  // Parse owner/name from URL
  const parsed = parseRepoUrl(repo_url, provider);
  if (!parsed) {
    return NextResponse.json({ error: "Invalid repository URL" }, { status: 400 });
  }

  // Validate PAT by making a test API call
  const isValid = await validateToken(provider, parsed.owner, parsed.name, access_token);
  if (!isValid) {
    return NextResponse.json(
      { error: "Invalid access token or repository not found" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("project_repositories")
    .insert({
      project_id: projectId,
      provider,
      repo_url,
      repo_owner: parsed.owner,
      repo_name: parsed.name,
      access_token,
      connected_by: user.user.id,
    })
    .select("id, project_id, provider, repo_url, repo_owner, repo_name, connected_by, connected_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

// DELETE: Disconnect repository
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const supabase = await createClient();

  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("project_repositories")
    .delete()
    .eq("project_id", projectId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

function parseRepoUrl(url: string, _provider: string): { owner: string; name: string } | null {
  try {
    const urlObj = new URL(url);
    const parts = urlObj.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;

    let name = parts[1];
    if (name.endsWith(".git")) {
      name = name.slice(0, -4);
    }

    return { owner: parts[0], name };
  } catch {
    return null;
  }
}

async function validateToken(
  provider: string,
  owner: string,
  name: string,
  token: string
): Promise<boolean> {
  try {
    if (provider === "github") {
      const res = await fetch(`https://api.github.com/repos/${owner}/${name}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      });
      return res.ok;
    }

    if (provider === "gitlab") {
      const encoded = encodeURIComponent(`${owner}/${name}`);
      const res = await fetch(`https://gitlab.com/api/v4/projects/${encoded}`, {
        headers: { "PRIVATE-TOKEN": token },
      });
      return res.ok;
    }

    return false;
  } catch {
    return false;
  }
}
