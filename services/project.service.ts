import { handleSupabaseError, requireAuth } from "@/lib/errors";
import { supabaseClient } from "@/lib/supabase/client";
import type { Project, ProjectFormSchema, ProjectUpdateSchema } from "@/types/project";

export const projectService = {
  async getAll(): Promise<Project[]> {
    return handleSupabaseError(() =>
      supabaseClient.from("projects").select("*").order("created_at", { ascending: false })
    );
  },

  async getById(id: string): Promise<Project> {
    return handleSupabaseError(() =>
      supabaseClient.from("projects").select("*").eq("id", id).single()
    );
  },

  async create(project: ProjectFormSchema): Promise<Project> {
    const userId = await requireAuth(supabaseClient);

    return handleSupabaseError(() =>
      supabaseClient
        .from("projects")
        .insert({
          ...project,
          created_by: userId,
        })
        .select()
        .single()
    );
  },

  async update(project: ProjectUpdateSchema): Promise<Project> {
    const { id, ...updates } = project;

    return handleSupabaseError(() =>
      supabaseClient
        .from("projects")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()
    );
  },

  async delete(id: string): Promise<void> {
    await handleSupabaseError(() => supabaseClient.from("projects").delete().eq("id", id).select());
  },

  async getStats(projectId: string) {
    const { data: tickets } = await supabaseClient
      .from("tickets")
      .select("state_id, priority_id")
      .eq("project_id", projectId);

    const { data: states } = await supabaseClient
      .from("ticket_states")
      .select("id, name")
      .eq("project_id", projectId);

    const { data: priorities } = await supabaseClient
      .from("ticket_priorities")
      .select("id, name")
      .eq("project_id", projectId);

    const stateStats =
      states?.map((state) => ({
        ...state,
        count: tickets?.filter((t) => t.state_id === state.id).length || 0,
      })) || [];

    const priorityStats =
      priorities?.map((priority) => ({
        ...priority,
        count: tickets?.filter((t) => t.priority_id === priority.id).length || 0,
      })) || [];

    return {
      totalTickets: tickets?.length || 0,
      stateStats,
      priorityStats,
    };
  },
};
