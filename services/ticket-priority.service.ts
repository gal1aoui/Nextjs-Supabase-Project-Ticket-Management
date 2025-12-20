import { supabaseClient } from "@/lib/helpers";
import type { TicketPriority } from "@/types/database";
import type { ticketPriorityCreate, ticketPriorityUpdate } from "@/types/ticket-priority";

export const ticketPriorityService = {
  async getByProject(projectId: string): Promise<TicketPriority[]> {
    const { data, error } = await supabaseClient
      .from("ticket_priorities")
      .select("*")
      .eq("project_id", projectId)
      .order("order", { ascending: true });

    if (error) throw error;
    return data;
  },

  async create(state: ticketPriorityCreate): Promise<TicketPriority> {

    const { data: states } = await supabaseClient
      .from("ticket_priorities")
      .select("order")
      .eq("project_id", state.project_id)
      .order("order", { ascending: false })
      .limit(1);

    const maxOrder = states?.[0]?.order ?? -1;

    const { data, error } = await supabaseClient
      .from("ticket_priorities")
      .insert({ ...state, order: state.order ?? maxOrder + 1 })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(state: ticketPriorityUpdate): Promise<TicketPriority> {
    const { id, ...updates } = state;

    const { data, error } = await supabaseClient
      .from("ticket_priorities")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabaseClient.from("ticket_priorities").delete().eq("id", id);
    if (error) throw error;
  },
};
