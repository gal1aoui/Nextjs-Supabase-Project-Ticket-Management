import { handleSupabaseError, requireAuth } from "@/lib/errors";
import { supabaseClient } from "@/lib/supabase/client";
import type { Notification } from "@/types/notification";

export const notificationService = {
  async getAll(): Promise<Notification[]> {
    const userId = await requireAuth(supabaseClient);

    return handleSupabaseError(() =>
      supabaseClient
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50)
    );
  },

  async getUnreadCount(): Promise<number> {
    const userId = await requireAuth(supabaseClient);

    const { count, error } = await supabaseClient
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("read", false);

    if (error) throw error;
    return count ?? 0;
  },

  async markAsRead(id: string): Promise<Notification> {
    return handleSupabaseError(() =>
      supabaseClient
        .from("notifications")
        .update({ read: true })
        .eq("id", id)
        .select()
        .single()
    );
  },

  async markAllAsRead(): Promise<void> {
    const userId = await requireAuth(supabaseClient);

    await handleSupabaseError(() =>
      supabaseClient
        .from("notifications")
        .update({ read: true })
        .eq("user_id", userId)
        .eq("read", false)
        .select()
    );
  },

  async delete(id: string): Promise<void> {
    await handleSupabaseError(() =>
      supabaseClient.from("notifications").delete().eq("id", id).select()
    );
  },

  async clearAll(): Promise<void> {
    const userId = await requireAuth(supabaseClient);

    await handleSupabaseError(() =>
      supabaseClient
        .from("notifications")
        .delete()
        .eq("user_id", userId)
        .select()
    );
  },

  async getByProject(projectId: string): Promise<Notification[]> {
    await requireAuth(supabaseClient);

    return handleSupabaseError(() =>
      supabaseClient
        .from("notifications")
        .select("*")
        .eq("metadata->>project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(100)
    );
  },
};
