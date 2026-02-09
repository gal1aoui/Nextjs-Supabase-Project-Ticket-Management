import { handleSupabaseError, requireAuth } from "@/lib/errors";
import { supabaseClient } from "@/lib/supabase/client";
import type {
  TicketCommentCreate,
  TicketCommentUpdate,
  TicketCommentWithAuthor,
} from "@/types/ticket-comment";

export const ticketCommentService = {
  async getByTicket(ticketId: string): Promise<TicketCommentWithAuthor[]> {
    return handleSupabaseError(() =>
      supabaseClient
        .from("ticket_comments")
        .select("*, author:profiles!ticket_comments_user_id_fkey(*)")
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true })
    );
  },

  async create(comment: TicketCommentCreate): Promise<TicketCommentWithAuthor> {
    const userId = await requireAuth(supabaseClient);

    const created = await handleSupabaseError(() =>
      supabaseClient
        .from("ticket_comments")
        .insert({ ...comment, user_id: userId })
        .select("*, author:profiles!ticket_comments_user_id_fkey(*)")
        .single()
    );

    // Parse @mentions from content and create mention records
    const mentions = parseMentions(comment.content);
    if (mentions.length > 0) {
      const mentionRecords = mentions.map((mentionedUserId) => ({
        comment_id: created.id,
        mentioned_user_id: mentionedUserId,
      }));

      await supabaseClient.from("comment_mentions").insert(mentionRecords);
    }

    return created;
  },

  async update(comment: TicketCommentUpdate): Promise<TicketCommentWithAuthor> {
    const { id, ...updates } = comment;

    const updated = await handleSupabaseError(() =>
      supabaseClient
        .from("ticket_comments")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select("*, author:profiles!ticket_comments_user_id_fkey(*)")
        .single()
    );

    // Re-parse mentions: delete old, insert new
    await supabaseClient.from("comment_mentions").delete().eq("comment_id", id);

    const mentions = parseMentions(updates.content);
    if (mentions.length > 0) {
      const mentionRecords = mentions.map((mentionedUserId) => ({
        comment_id: id,
        mentioned_user_id: mentionedUserId,
      }));
      await supabaseClient.from("comment_mentions").insert(mentionRecords);
    }

    return updated;
  },

  async delete(id: string): Promise<void> {
    await handleSupabaseError(() =>
      supabaseClient.from("ticket_comments").delete().eq("id", id).select()
    );
  },
};

/**
 * Parse @mention UUIDs from comment content.
 * Format: @[userId] (UUID pattern)
 */
function parseMentions(content: string): string[] {
  const mentionRegex = /@\[([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\]/gi;
  const mentions: string[] = [];
  let match = mentionRegex.exec(content);
  while (match) {
    if (!mentions.includes(match[1])) {
      mentions.push(match[1]);
    }
    match = mentionRegex.exec(content);
  }
  return mentions;
}
