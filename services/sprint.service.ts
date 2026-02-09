import { handleSupabaseError, requireAuth } from "@/lib/errors";
import { supabaseClient } from "@/lib/supabase/client";
import type { Sprint, SprintCreate, SprintUpdate } from "@/types/sprint";

export const sprintService = {
  async getByProject(projectId: string): Promise<Sprint[]> {
    return handleSupabaseError(() =>
      supabaseClient
        .from("sprints")
        .select("*")
        .eq("project_id", projectId)
        .order("start_date", { ascending: true })
    );
  },

  async getById(id: string): Promise<Sprint> {
    return handleSupabaseError(() =>
      supabaseClient.from("sprints").select("*").eq("id", id).single()
    );
  },

  async getActive(projectId: string): Promise<Sprint | null> {
    const { data } = await supabaseClient
      .from("sprints")
      .select("*")
      .eq("project_id", projectId)
      .eq("status", "active")
      .single();

    return data;
  },

  async create(sprint: SprintCreate): Promise<Sprint> {
    const userId = await requireAuth(supabaseClient);

    return handleSupabaseError(() =>
      supabaseClient
        .from("sprints")
        .insert({ ...sprint, created_by: userId })
        .select()
        .single()
    );
  },

  async update(sprint: SprintUpdate): Promise<Sprint> {
    const { id, ...updates } = sprint;

    return handleSupabaseError(() =>
      supabaseClient
        .from("sprints")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()
    );
  },

  async delete(id: string): Promise<void> {
    await handleSupabaseError(() =>
      supabaseClient.from("sprints").delete().eq("id", id).select()
    );
  },
};
