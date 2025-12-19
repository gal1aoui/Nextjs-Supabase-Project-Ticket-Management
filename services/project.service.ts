import { createClient } from "@/lib/supabase/client";
import type { Project } from "@/types/database";
import type { ProjectCreate, ProjectUpdate } from "@/types/project";

export const projectService = {
  async getAll(): Promise<Project[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string): Promise<Project> {
    const supabase = createClient();
    const { data, error } = await supabase.from("projects").select("*").eq("id", id).single();

    if (error) throw error;
    return data;
  },

  async create(project: ProjectCreate): Promise<Project> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("projects")
      .insert({ ...project, created_by: user.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(project: ProjectUpdate): Promise<Project> {
    const supabase = createClient();
    const { id, ...updates } = project;

    const { data, error } = await supabase
      .from("projects")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) throw error;
  },

  async getStats(projectId: string) {
    const supabase = createClient();

    const { data: tickets } = await supabase
      .from("tickets")
      .select("state_id, priority_id")
      .eq("project_id", projectId);

    const { data: states } = await supabase
      .from("ticket_states")
      .select("id, name")
      .eq("project_id", projectId);

    const { data: priorities } = await supabase
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
