"use client";

import { formatDistanceToNow } from "date-fns";
import {
  AtSign,
  Bell,
  CalendarCheck,
  CalendarX,
  CheckCircle,
  Flag,
  MessageSquare,
  RefreshCw,
  Rocket,
  Tag,
  Trophy,
  UserMinus,
  UserPlus,
  UserX,
  XCircle,
} from "lucide-react";

import { Spinner } from "@/components/ui/spinner";
import { formatNotificationMessage } from "@/lib/notification-utils";
import type { Notification, NotificationType } from "@/types/notification";

const typeIcons: Record<NotificationType, React.ReactNode> = {
  ticket_assigned: <Tag className="h-4 w-4 text-blue-500" />,
  ticket_state_changed: <RefreshCw className="h-4 w-4 text-orange-500" />,
  ticket_priority_changed: <Flag className="h-4 w-4 text-yellow-500" />,
  ticket_commented: <MessageSquare className="h-4 w-4 text-green-500" />,
  comment_mention: <AtSign className="h-4 w-4 text-purple-500" />,
  project_invite: <UserPlus className="h-4 w-4 text-blue-500" />,
  project_invite_accepted: <CheckCircle className="h-4 w-4 text-green-500" />,
  project_invite_declined: <XCircle className="h-4 w-4 text-red-500" />,
  member_removed: <UserMinus className="h-4 w-4 text-red-500" />,
  member_role_changed: <UserX className="h-4 w-4 text-orange-500" />,
  event_invite: <CalendarCheck className="h-4 w-4 text-blue-500" />,
  event_updated: <CalendarCheck className="h-4 w-4 text-orange-500" />,
  event_cancelled: <CalendarX className="h-4 w-4 text-red-500" />,
  event_response: <CalendarCheck className="h-4 w-4 text-green-500" />,
  sprint_started: <Rocket className="h-4 w-4 text-blue-500" />,
  sprint_completed: <Trophy className="h-4 w-4 text-green-500" />,
};

interface NotificationListProps {
  notifications: Notification[];
  isLoading: boolean;
  onNotificationClick?: (notification: Notification) => void;
  showReadIndicator?: boolean;
  currentUserId?: string;
}

export function NotificationList({
  notifications,
  isLoading,
  onNotificationClick,
  showReadIndicator = true,
  currentUserId,
}: NotificationListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
        <Bell className="h-8 w-8 mb-2 opacity-50" />
        <p className="text-sm">No notifications</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {notifications.map((notification) => (
        <button
          key={notification.id}
          type="button"
          className="flex items-start gap-3 w-full rounded-md p-3 text-left hover:bg-accent transition-colors cursor-pointer"
          onClick={() => onNotificationClick?.(notification)}
        >
          <span className="mt-0.5 shrink-0">
            {typeIcons[notification.type] ?? <Bell className="h-4 w-4" />}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex w-full items-start justify-between gap-2">
              <span className="font-medium text-sm truncate">
                {notification.title}
              </span>
              {showReadIndicator && !notification.read && (
                <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {formatNotificationMessage(notification, currentUserId)}
            </p>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.created_at), {
                addSuffix: true,
              })}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
