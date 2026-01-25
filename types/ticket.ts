import { z } from "zod";
import type { Database } from "./database";

// Base ticket type from database
type TicketRow = Database["public"]["Tables"]["tickets"]["Row"];

// Extended ticket type with sort_order (optional until database types are regenerated)
export type Ticket = TicketRow & {
  sort_order?: number;
};

export const ticketCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional(),
  project_id: z.uuid(),
  state_id: z.uuid(),
  priority_id: z.uuid().optional(),
  assigned_to: z.uuid(),
  sort_order: z.number().int().default(0),
});

export const ticketUpdateSchema = z.object({
  id: z.uuid(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  state_id: z.uuid().optional(),
  priority_id: z.uuid().optional(),
  assigned_to: z.uuid().optional(),
  sort_order: z.number().int().optional(),
});

export const ticketReorderSchema = z.object({
  ticketId: z.uuid(),
  newStateId: z.uuid(),
  newSortOrder: z.number().int(),
});

export type TicketCreate = z.infer<typeof ticketCreateSchema>;
export type TicketUpdate = z.infer<typeof ticketUpdateSchema>;
export type TicketReorder = z.infer<typeof ticketReorderSchema>;
