import { z } from "zod";

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
