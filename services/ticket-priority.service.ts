import { supabaseClient } from "@/lib/supabase/client";
import type { TicketPriority } from "@/types/database";
import type { TicketPriorityFormSchema, TicketPriorityUpdateSchema } from "@/types/ticket-priority";

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

  async create(state: TicketPriorityFormSchema, project_id: string): Promise<TicketPriority> {
    const { data: states } = await supabaseClient
      .from("ticket_priorities")
      .select("order")
      .eq("project_id", project_id)
      .order("order", { ascending: false })
      .limit(1);

    const maxOrder = states?.[0]?.order ?? -1;

    const { data, error } = await supabaseClient
      .from("ticket_priorities")
      .insert({ ...state, order: state.order ?? maxOrder + 1, project_id })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(state: TicketPriorityUpdateSchema): Promise<TicketPriority> {
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
