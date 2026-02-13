"use client";

import { useQueryClient } from "@tanstack/react-query";
import { type ReactNode, useEffect, useRef } from "react";
import { toast } from "sonner";

import { useUser } from "@/hooks/use-user";
import { getNotificationIcon } from "@/lib/notification-utils";
import { supabaseClient } from "@/lib/supabase/client";
import { notificationKeys } from "@/stores/notification.store";
import type { Notification } from "@/types/notification";

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { data: user } = useUser();
  const queryClient = useQueryClient();
  const channelRef = useRef<ReturnType<typeof supabaseClient.channel> | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabaseClient
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const notification = payload.new as Notification;

          // Invalidate queries to refresh the list and count
          queryClient.invalidateQueries({ queryKey: notificationKeys.all });
          queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount });

          // Show a toast for the new notification
          toast(notification.title, {
            description: notification.message,
            icon: getNotificationIcon(notification.type),
          });
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabaseClient.removeChannel(channel);
      channelRef.current = null;
    };
  }, [user?.id, queryClient]);

  return <>{children}</>;
}
