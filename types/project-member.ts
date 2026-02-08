import { z } from "zod";

// ===========================================
// Database Types
// ===========================================

export type ProjectMember = {
  id: string;
  project_id: string;
  user_id: string;
  role_id: string;
  invited_by: string | null;
  invited_at: string;
  joined_at: string | null;
  status: "pending" | "active" | "inactive";
};

// ===========================================
// Form Schemas (UI forms)
// ===========================================

export const projectMemberInviteSchema = z.object({
  project_id: z.uuid(),
  user_id: z.uuid(),
  role_id: z.uuid(),
});

export const projectMemberUpdateSchema = z.object({
  id: z.uuid(),
  role_id: z.uuid().optional(),
  status: z.enum(["pending", "active", "inactive"]).optional(),
});

export type ProjectMemberInvite = z.infer<typeof projectMemberInviteSchema>;
export type ProjectMemberUpdate = z.infer<typeof projectMemberUpdateSchema>;
