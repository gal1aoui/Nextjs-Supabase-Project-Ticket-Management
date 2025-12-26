import { z } from "zod";

export const projectFormSchema = z.object({
  name: z.string().min(3, "Project name is required").max(100),
  description: z.string().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i)
    .optional(),
});

export type ProjectFormSchema = z.infer<typeof projectFormSchema>;

const projectUpdate = z.object({
  id: z.uuid(),
});

const projectUpdateSchema = z.intersection(projectFormSchema, projectUpdate);

export type ProjectUpdateSchema = z.infer<typeof projectUpdateSchema>;
