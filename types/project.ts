import { z } from "zod";

// ===========================================
// Database Types
// ===========================================

export type Project = {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
};

// ===========================================
// Form Schemas (UI forms)
// ===========================================

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
