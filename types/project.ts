import { z } from "zod";

export const projectCreateSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100),
  description: z.string().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i)
    .optional(),
});

export const projectUpdateSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i)
    .optional(),
});

export type ProjectCreate = z.infer<typeof projectCreateSchema>;
export type ProjectUpdate = z.infer<typeof projectUpdateSchema>;
