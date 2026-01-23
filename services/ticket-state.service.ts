import { handleSupabaseError } from "@/lib/errors";
import { supabaseClient } from "@/lib/supabase/client";
import type { TicketState } from "@/types/database";
import type { TicketStateFormSchema, TicketStateUpdateSchema } from "@/types/ticket-state";

export const ticketStateService = {
  async getByProject(projectId: string): Promise<TicketState[]> {
    return handleSupabaseError(() =>
      supabaseClient
        .from("ticket_states")
        .select("*")
        .eq("project_id", projectId)
        .order("order", { ascending: true })
    );
  },

  async create(state: TicketStateFormSchema, project_id: string): Promise<TicketState> {
    const { data: states } = await supabaseClient
      .from("ticket_states")
      .select("order")
      .eq("project_id", project_id)
      .order("order", { ascending: false })
      .limit(1);

    const maxOrder = states?.[0]?.order ?? -1;

    return handleSupabaseError(() =>
      supabaseClient
        .from("ticket_states")
        .insert({ ...state, order: state.order ?? maxOrder + 1, project_id })
        .select()
        .single()
    );
  },

  async update(state: TicketStateUpdateSchema): Promise<TicketState> {
    const { id, ...updates } = state;

    return handleSupabaseError(() =>
      supabaseClient.from("ticket_states").update(updates).eq("id", id).select().single()
    );
  },

  async delete(id: string): Promise<void> {
    await handleSupabaseError(() =>
      supabaseClient.from("ticket_states").delete().eq("id", id).select()
    );
  },
};
