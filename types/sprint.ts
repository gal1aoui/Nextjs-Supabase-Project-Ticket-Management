import { z } from "zod";

// ===========================================
// Database Types
// ===========================================

export type SprintStatus = "planning" | "active" | "completed";

export type Sprint = {
  id: string;
  project_id: string;
  name: string;
  goal: string | null;
  start_date: string;
  end_date: string;
  status: SprintStatus;
  sort_order: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

// ===========================================
// Form Schemas
// ===========================================

export const sprintCreateSchema = z.object({
  name: z.string().min(1, "Sprint name is required").max(100),
  goal: z.string().max(500).optional(),
  project_id: z.uuid(),
  start_date: z.string(),
  end_date: z.string(),
  status: z.enum(["planning", "active", "completed"]).default("planning"),
});

export type SprintCreate = z.infer<typeof sprintCreateSchema>;

export const sprintUpdateSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1).max(100).optional(),
  goal: z.string().max(500).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  status: z.enum(["planning", "active", "completed"]).optional(),
});

export type SprintUpdate = z.infer<typeof sprintUpdateSchema>;
