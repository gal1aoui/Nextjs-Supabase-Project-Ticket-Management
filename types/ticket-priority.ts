import { z } from "zod";

export const ticketPriorityCreateSchema = z.object({
  name: z.string().min(1, "Priority name is required").max(50),
  project_id: z.uuid("Invalid project ID"),
  order: z.number().int().min(0).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i)
    .optional(),
});

export const ticketPriorityUpdateSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1).max(50).optional(),
  order: z.number().int().min(0).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i)
    .optional(),
});

export type ticketPriorityCreate = z.infer<typeof ticketPriorityCreateSchema>;
export type ticketPriorityUpdate = z.infer<typeof ticketPriorityUpdateSchema>;
