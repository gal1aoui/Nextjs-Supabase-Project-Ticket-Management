import { z } from "zod";

export const ticketStateCreateSchema = z.object({
  name: z.string().min(1, "State name is required").max(50),
  project_id: z.uuid("Invalid project ID"),
  order: z.number().int().min(0).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i)
    .optional(),
});

export const ticketStateUpdateSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1).max(50).optional(),
  order: z.number().int().min(0).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i)
    .optional(),
});

export type TicketStateCreate = z.infer<typeof ticketStateCreateSchema>;
export type TicketStateUpdate = z.infer<typeof ticketStateUpdateSchema>;
