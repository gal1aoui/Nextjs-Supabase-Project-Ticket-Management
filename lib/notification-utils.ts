import type { Notification, NotificationMetadata, NotificationType } from "@/types/notification";

/**
 * Returns an emoji icon string for toast notifications based on type.
 */
export function getNotificationIcon(type: NotificationType): string {
  const icons: Record<NotificationType, string> = {
    ticket_assigned: "🎫",
    ticket_state_changed: "🔄",
    ticket_priority_changed: "⚡",
    ticket_commented: "💬",
    comment_mention: "@",
    project_invite: "📨",
    project_invite_accepted: "✅",
    project_invite_declined: "❌",
    member_removed: "👋",
    member_role_changed: "🔑",
    event_invite: "📅",
    event_updated: "📅",
    event_cancelled: "🚫",
    event_response: "📅",
    sprint_started: "🏃",
    sprint_completed: "🏁",
  };

  return icons[type] ?? "🔔";
}

const ticketTypes: NotificationType[] = [
  "ticket_assigned", "ticket_state_changed", "ticket_priority_changed",
  "ticket_commented", "comment_mention",
];
const memberTypes: NotificationType[] = [
  "project_invite", "project_invite_accepted", "project_invite_declined",
  "member_removed", "member_role_changed",
];
const eventTypes: NotificationType[] = [
  "event_invite", "event_updated", "event_cancelled", "event_response",
];
const sprintTypes: NotificationType[] = ["sprint_started", "sprint_completed"];

/**
 * Returns a navigation URL based on notification metadata.
 */
export function getNotificationUrl(
  type: NotificationType,
  metadata: NotificationMetadata
): string | null {
  const { project_id, ticket_id, event_id, sprint_id } = metadata;

  if (!project_id) return null;

  if (ticketTypes.includes(type) && ticket_id) {
    return `/projects/${project_id}?ticket=${ticket_id}`;
  }

  if (memberTypes.includes(type)) {
    return `/projects/${project_id}`;
  }

  if (eventTypes.includes(type)) {
    const params = event_id ? `tab=calendar&event=${event_id}` : "tab=calendar";
    return `/projects/${project_id}?${params}`;
  }

  if (sprintTypes.includes(type)) {
    const params = sprint_id ? `tab=sprints&sprint=${sprint_id}` : "tab=sprints";
    return `/projects/${project_id}?${params}`;
  }

  return null;
}

/**
 * Personalizes a notification message based on the current viewer.
 * - If the viewer is the actor: "You assigned..." instead of "John assigned..."
 * - If the viewer is the recipient: keeps the original message (already addressed to "you")
 * - Otherwise (project history): third-person with target name replacing "you/your"
 */
export function formatNotificationMessage(
  notification: Notification,
  currentUserId?: string
): string {
  const { actor_id, actor_name, target_name } = notification.metadata;

  if (!actor_name && !target_name) return notification.message;

  // Current user is the actor — swap actor name for "You"
  if (currentUserId && actor_id === currentUserId && actor_name) {
    return notification.message.replace(actor_name, "You");
  }

  // Current user is the notification recipient — already correct
  if (currentUserId && notification.user_id === currentUserId) {
    return notification.message;
  }

  // Third-party viewer (project history) — replace second-person with target name
  if (!target_name) return notification.message;

  return notification.message
    .replace(/ you to /i, ` ${target_name} to `)
    .replace(/ invited you /i, ` invited ${target_name} `)
    .replace(/ mentioned you /i, ` mentioned ${target_name} `)
    .replace(/ your event /i, ` ${target_name}'s event `);
}
