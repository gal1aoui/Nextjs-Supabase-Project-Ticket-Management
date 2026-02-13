"use client";

import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { NotificationList } from "@/components/notifications/notification-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDrawer } from "@/contexts/drawer/drawer-context";
import { useUser } from "@/hooks/use-user";
import { getNotificationUrl } from "@/lib/notification-utils";
import {
  useClearAllNotifications,
  useMarkAllAsRead,
  useMarkAsRead,
  useNotifications,
  useUnreadCount,
} from "@/stores/notification.store";
import type { Notification } from "@/types/notification";

function NotificationDrawerContent({ close }: { close: () => void }) {
  const router = useRouter();
  const { data: user } = useUser();
  const { data: notifications = [], isLoading } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadCount();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const clearAll = useClearAllNotifications();

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead.mutate(notification.id);
    }

    const url = getNotificationUrl(notification.type, notification.metadata);
    if (url) {
      close();
      router.push(url);
    }
  };

  return (
    <div className="flex flex-col h-full -mx-6 -my-5">
      {(notifications.length > 0 || unreadCount > 0) && (
        <div className="flex items-center justify-end gap-2 px-6 py-3 border-b">
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-destructive"
              onClick={() => clearAll.mutate()}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear all
            </Button>
          )}
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => markAllAsRead.mutate()}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all as read
            </Button>
          )}
        </div>
      )}
      <ScrollArea className="flex-1">
        <div className="px-3 py-2">
          <NotificationList
            notifications={notifications}
            isLoading={isLoading}
            onNotificationClick={handleNotificationClick}
            currentUserId={user?.id}
          />
        </div>
      </ScrollArea>
    </div>
  );
}

export function NotificationDropdown() {
  const { data: unreadCount = 0 } = useUnreadCount();
  const { openDrawer } = useDrawer();

  const handleOpen = () => {
    openDrawer({
      title: "Notifications",
      description: "Your recent notifications",
      render: ({ close }) => <NotificationDrawerContent close={close} />,
    });
  };

  return (
    <Button variant="ghost" size="icon" className="relative" onClick={handleOpen}>
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
        >
          {unreadCount > 9 ? "9+" : unreadCount}
        </Badge>
      )}
    </Button>
  );
}
