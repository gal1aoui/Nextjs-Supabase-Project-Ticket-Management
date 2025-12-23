import { supabaseClient } from "@/lib/supabase/client";
import type { TicketState } from "@/types/database";
import type { TicketStateCreate, TicketStateUpdate } from "@/types/ticket-state";

export const ticketStateService = {
  async getByProject(projectId: string): Promise<TicketState[]> {
    const { data, error } = await supabaseClient
      .from("ticket_states")
      .select("*")
      .eq("project_id", projectId)
      .order("order", { ascending: true });

    if (error) throw error;
    return data;
  },

  async create(state: TicketStateCreate): Promise<TicketState> {
    // Get max order for project
    const { data: states } = await supabaseClient
      .from("ticket_states")
      .select("order")
      .eq("project_id", state.project_id)
      .order("order", { ascending: false })
      .limit(1);

    const maxOrder = states?.[0]?.order ?? -1;

    const { data, error } = await supabaseClient
      .from("ticket_states")
      .insert({ ...state, order: state.order ?? maxOrder + 1 })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(state: TicketStateUpdate): Promise<TicketState> {
    const { id, ...updates } = state;

    const { data, error } = await supabaseClient
      .from("ticket_states")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabaseClient.from("ticket_states").delete().eq("id", id);
    if (error) throw error;
  },
};
