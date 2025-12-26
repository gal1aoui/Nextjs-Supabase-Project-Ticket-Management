import { z } from "zod";

export const ticketPriorityFormSchema = z.object({
  name: z.string().min(3, "Project name is required").max(100),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i)
    .optional(),
  order: z.number().int().min(0).optional(),
});

export type TicketPriorityFormSchema = z.infer<typeof ticketPriorityFormSchema>;

const ticketPriorityUpdate = z.object({
  id: z.uuid(),
});

const ticketPriorityUpdateSchema = z.intersection(ticketPriorityFormSchema, ticketPriorityUpdate);

export type TicketPriorityUpdateSchema = z.infer<typeof ticketPriorityUpdateSchema>;
