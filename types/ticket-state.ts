import { z } from "zod";

export const ticketStateFormSchema = z.object({
  name: z.string().min(3, "Project name is required").max(100),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i)
    .optional(),
  order: z.number().int().min(0).optional(),
});

export type TicketStateFormSchema = z.infer<typeof ticketStateFormSchema>;

const ticketStateUpdate = z.object({
  id: z.uuid(),
});

const ticketStateUpdateSchema = z.intersection(ticketStateFormSchema, ticketStateUpdate);

export type TicketStateUpdateSchema = z.infer<typeof ticketStateUpdateSchema>;
