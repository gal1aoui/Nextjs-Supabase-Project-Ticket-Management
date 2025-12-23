import { z } from "zod";

export const profileUpdateSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  full_name: z.string().min(1).max(100).optional(),
  avatar_url: z.url().optional().nullable(),
  website: z.string().url().optional().nullable(),
});

export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;
