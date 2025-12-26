import { z } from "zod";

export const workspaceCreateSchema = z.object({
  name: z.string().min(1, "Workspace name is required").max(100),
  description: z.string().optional(),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  avatar_url: z.string().url().optional().nullable(),
});

export const workspaceUpdateSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  slug: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  avatar_url: z.url().optional().nullable(),
});

export type WorkspaceCreate = z.infer<typeof workspaceCreateSchema>;
export type WorkspaceUpdate = z.infer<typeof workspaceUpdateSchema>;
