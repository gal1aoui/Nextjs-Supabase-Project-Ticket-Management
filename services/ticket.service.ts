import { createClient } from "@/lib/supabase/client";
import type { Ticket } from "@/types/database";
import type { TicketCreate, TicketUpdate } from "@/types/ticket";

export const ticketService = {
  async getByProject(projectId: string): Promise<Ticket[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string): Promise<Ticket> {
    const supabase = createClient();
    const { data, error } = await supabase.from("tickets").select("*").eq("id", id).single();

    if (error) throw error;
    return data;
  },

  async create(ticket: TicketCreate): Promise<Ticket> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("tickets")
      .insert({ ...ticket, created_by: user.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(ticket: TicketUpdate): Promise<Ticket> {
    const supabase = createClient();
    const { id, ...updates } = ticket;

    const { data, error } = await supabase
      .from("tickets")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("tickets").delete().eq("id", id);
    if (error) throw error;
  },
};
