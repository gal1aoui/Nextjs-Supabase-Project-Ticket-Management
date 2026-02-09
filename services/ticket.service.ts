import { handleSupabaseError, requireAuth } from "@/lib/errors";
import { supabaseClient } from "@/lib/supabase/client";
import type { Ticket, TicketCreate, TicketUpdate } from "@/types/ticket";

export interface ReorderTicketParams {
  ticketId: string;
  newStateId: string;
  newSortOrder: number;
}

export const ticketService = {
  async getByProject(projectId: string): Promise<Ticket[]> {
    return handleSupabaseError(() =>
      supabaseClient
        .from("tickets")
        .select("*")
        .eq("project_id", projectId)
        .order("sort_order", { ascending: true })
    );
  },

  async getById(id: string): Promise<Ticket> {
    return handleSupabaseError(() =>
      supabaseClient.from("tickets").select("*").eq("id", id).single()
    );
  },

  async create(ticket: TicketCreate): Promise<Ticket> {
    const userId = await requireAuth(supabaseClient);

    return handleSupabaseError(() =>
      supabaseClient
        .from("tickets")
        .insert({ ...ticket, created_by: userId })
        .select()
        .single()
    );
  },

  async update(ticket: TicketUpdate): Promise<Ticket> {
    const { id, ...updates } = ticket;

    return handleSupabaseError(() =>
      supabaseClient
        .from("tickets")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()
    );
  },

  async delete(id: string): Promise<void> {
    await handleSupabaseError(() => supabaseClient.from("tickets").delete().eq("id", id).select());
  },

  async getBacklog(projectId: string): Promise<Ticket[]> {
    return handleSupabaseError(() =>
      supabaseClient
        .from("tickets")
        .select("*")
        .eq("project_id", projectId)
        .is("sprint_id", null)
        .order("sort_order", { ascending: true })
    );
  },

  async getBySprint(projectId: string, sprintId: string): Promise<Ticket[]> {
    return handleSupabaseError(() =>
      supabaseClient
        .from("tickets")
        .select("*")
        .eq("project_id", projectId)
        .eq("sprint_id", sprintId)
        .order("sort_order", { ascending: true })
    );
  },

  async assignToSprint(ticketId: string, sprintId: string | null): Promise<Ticket> {
    return handleSupabaseError(() =>
      supabaseClient
        .from("tickets")
        .update({ sprint_id: sprintId, updated_at: new Date().toISOString() })
        .eq("id", ticketId)
        .select()
        .single()
    );
  },

  async reorder({ ticketId, newStateId, newSortOrder }: ReorderTicketParams): Promise<Ticket> {
    return handleSupabaseError(() =>
      supabaseClient
        .from("tickets")
        .update({
          state_id: newStateId,
          sort_order: newSortOrder,
          updated_at: new Date().toISOString(),
        })
        .eq("id", ticketId)
        .select()
        .single()
    );
  },
};
