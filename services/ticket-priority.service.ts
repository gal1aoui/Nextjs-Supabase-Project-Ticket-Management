import { handleSupabaseError } from "@/lib/errors";
import { supabaseClient } from "@/lib/supabase/client";
import type {
  TicketPriority,
  TicketPriorityFormSchema,
  TicketPriorityUpdateSchema,
} from "@/types/ticket-priority";

export const ticketPriorityService = {
  async getByProject(projectId: string): Promise<TicketPriority[]> {
    return handleSupabaseError(() =>
      supabaseClient
        .from("ticket_priorities")
        .select("*")
        .eq("project_id", projectId)
        .order("order", { ascending: true })
    );
  },

  async getDefaults(): Promise<TicketPriority[]> {
    return handleSupabaseError(() =>
      supabaseClient
        .from("ticket_priorities")
        .select("*")
        .is("project_id", null)
        .order("order", { ascending: true })
    );
  },

  async create(priority: TicketPriorityFormSchema, project_id: string): Promise<TicketPriority> {
    const { data: priorities } = await supabaseClient
      .from("ticket_priorities")
      .select("order")
      .eq("project_id", project_id)
      .order("order", { ascending: false })
      .limit(1);

    const maxOrder = priorities?.[0]?.order ?? -1;

    return handleSupabaseError(() =>
      supabaseClient
        .from("ticket_priorities")
        .insert({ ...priority, order: priority.order ?? maxOrder + 1, project_id })
        .select()
        .single()
    );
  },

  async update(priority: TicketPriorityUpdateSchema): Promise<TicketPriority> {
    const { id, ...updates } = priority;

    return handleSupabaseError(() =>
      supabaseClient.from("ticket_priorities").update(updates).eq("id", id).select().single()
    );
  },

  async delete(id: string): Promise<void> {
    await handleSupabaseError(() =>
      supabaseClient.from("ticket_priorities").delete().eq("id", id).select()
    );
  },
};
