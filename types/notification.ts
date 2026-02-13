export const NOTIFICATION_TYPES = [
  "ticket_assigned",
  "ticket_state_changed",
  "ticket_priority_changed",
  "ticket_commented",
  "comment_mention",
  "project_invite",
  "project_invite_accepted",
  "project_invite_declined",
  "member_removed",
  "member_role_changed",
  "event_invite",
  "event_updated",
  "event_cancelled",
  "event_response",
  "sprint_started",
  "sprint_completed",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export interface NotificationMetadata {
  project_id?: string;
  ticket_id?: string;
  event_id?: string;
  sprint_id?: string;
  actor_id?: string;
  actor_name?: string;
  target_name?: string;
  resource_name?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  metadata: NotificationMetadata;
  created_at: string;
}
