import { z } from "zod";
import type { Profile } from "./profile";

// ===========================================
// Database Types
// ===========================================

export type TicketComment = {
  id: string;
  ticket_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export type TicketCommentWithAuthor = TicketComment & {
  author: Profile;
};

// ===========================================
// Form Schemas
// ===========================================

export const ticketCommentCreateSchema = z.object({
  ticket_id: z.uuid(),
  content: z.string().min(1, "Comment cannot be empty").max(5000),
});

export type TicketCommentCreate = z.infer<typeof ticketCommentCreateSchema>;

export const ticketCommentUpdateSchema = z.object({
  id: z.uuid(),
  content: z.string().min(1, "Comment cannot be empty").max(5000),
});

export type TicketCommentUpdate = z.infer<typeof ticketCommentUpdateSchema>;
