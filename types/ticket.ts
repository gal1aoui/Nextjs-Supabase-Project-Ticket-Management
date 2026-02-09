import { z } from "zod";

// ===========================================
// Database Types
// ===========================================

export type Ticket = {
  id: string;
  title: string;
  description: string | null;
  project_id: string;
  state_id: string;
  assigned_to: string | null;
  priority_id: string | null;
  sprint_id: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
};

// ===========================================
// Form Schemas (UI forms)
// ===========================================

export const ticketCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional(),
  project_id: z.uuid(),
  state_id: z.uuid(),
  priority_id: z.uuid().optional(),
  assigned_to: z.uuid(),
  sprint_id: z.uuid().optional(),
  sort_order: z.number().int().default(0),
});

export const ticketUpdateSchema = z.object({
  id: z.uuid(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  state_id: z.uuid().optional(),
  priority_id: z.uuid().optional(),
  assigned_to: z.uuid().optional(),
  sprint_id: z.uuid().nullable().optional(),
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
