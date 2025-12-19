import { z } from "zod";

export const ticketCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional(),
  project_id: z.uuid(),
  state_id: z.uuid(),
  priority_id: z.uuid().optional(),
  assigned_to: z.uuid(),
});

export const ticketUpdateSchema = z.object({
  id: z.uuid(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  state_id: z.uuid(),
  priority_id: z.uuid().optional(),
  assigned_to: z.uuid().optional(),
});

export type TicketCreate = z.infer<typeof ticketCreateSchema>;
export type TicketUpdate = z.infer<typeof ticketUpdateSchema>;
