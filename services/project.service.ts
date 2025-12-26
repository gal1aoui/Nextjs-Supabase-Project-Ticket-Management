import { supabaseClient } from "@/lib/supabase/client";
import type { Project } from "@/types/database";
import type { ProjectFormSchema, ProjectUpdateSchema } from "@/types/project";

export const projectService = {
  async getAll(): Promise<Project[]> {
    const { data, error } = await supabaseClient
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string): Promise<Project> {
    const { data, error } = await supabaseClient.from("projects").select("*").eq("id", id).single();

    if (error) throw error;
    return data;
  },

  async create(project: ProjectFormSchema): Promise<Project> {
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabaseClient
      .from("projects")
      .insert({
        ...project,
        created_by: user.id,
        workspace_id: "2ced7500-507e-4a5f-8128-661b91a48324",
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(project: ProjectUpdateSchema): Promise<Project> {
    const { id, ...updates } = project;

    const { data, error } = await supabaseClient
      .from("projects")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabaseClient.from("projects").delete().eq("id", id);
    if (error) throw error;
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
