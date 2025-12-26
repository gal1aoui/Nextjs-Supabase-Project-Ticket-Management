import { z } from "zod";

export const workspaceMemberInviteSchema = z.object({
  workspace_id: z.uuid(),
  user_id: z.uuid(),
  role_id: z.uuid(),
});

export const workspaceMemberUpdateSchema = z.object({
  id: z.uuid(),
  role_id: z.uuid().optional(),
  status: z.enum(["pending", "active", "inactive"]).optional(),
});

export type WorkspaceMemberInvite = z.infer<typeof workspaceMemberInviteSchema>;
export type WorkspaceMemberUpdate = z.infer<typeof workspaceMemberUpdateSchema>;
