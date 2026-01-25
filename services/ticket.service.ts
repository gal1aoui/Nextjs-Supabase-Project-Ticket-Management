import { handleSupabaseError, requireAuth } from "@/lib/errors";
import { supabaseClient } from "@/lib/supabase/client";
import type { Ticket } from "@/types/database";
import type { TicketCreate, TicketUpdate } from "@/types/ticket";

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
