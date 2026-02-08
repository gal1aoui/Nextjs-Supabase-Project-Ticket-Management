import { z } from "zod";

// ===========================================
// Database Types
// ===========================================

export type Profile = {
  id: string;
  updated_at: string | null;
  username: string | null;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  website: string | null;
};

// ===========================================
// Form Schemas (UI forms)
// ===========================================

export const profileUpdateSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  full_name: z.string().min(1).max(100).optional(),
  avatar_url: z.url().optional().nullable(),
  website: z.string().url().optional().nullable(),
});

export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;
