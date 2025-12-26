import { createClient } from "@/lib/supabase/client";
import type { Workspace, WorkspaceWithCounts } from "@/types/database";
import type { WorkspaceCreate, WorkspaceUpdate } from "@/types/workspace";

export const workspaceService = {
  async getAll(): Promise<WorkspaceWithCounts[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("workspaces")
      .select(`
        *,
        projects:projects(count),
        members:workspace_members!workspace_members_workspace_id_fkey(count)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data.map((workspace) => ({
      id: workspace.id,
      name: workspace.name,
      description: workspace.description,
      slug: workspace.slug,
      avatar_url: workspace.avatar_url,
      created_at: workspace.created_at,
      updated_at: workspace.updated_at,
      created_by: workspace.created_by,
      project_count: workspace.projects[0]?.count || 0,
      member_count: workspace.members[0]?.count || 0,
    }));
  },

  async getById(id: string): Promise<Workspace> {
    const supabase = createClient();
    const { data, error } = await supabase.from("workspaces").select("*").eq("id", id).single();

    if (error) throw error;
    return data;
  },

  async getBySlug(slug: string): Promise<Workspace> {
    const supabase = createClient();
    const { data, error } = await supabase.from("workspaces").select("*").eq("slug", slug).single();

    if (error) throw error;
    return data;
  },

  async create(workspace: WorkspaceCreate): Promise<Workspace> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("workspaces")
      .insert({ ...workspace, created_by: user.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(workspace: WorkspaceUpdate): Promise<Workspace> {
    const supabase = createClient();
    const { id, ...updates } = workspace;

    const { data, error } = await supabase
      .from("workspaces")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("workspaces").delete().eq("id", id);
    if (error) throw error;
  },
};
