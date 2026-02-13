import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/services/notification.service";
import type { Notification } from "@/types/notification";

export const notificationKeys = {
  all: ["notifications"] as const,
  unreadCount: ["notifications", "unread-count"] as const,
  byProject: (projectId: string) => ["notifications", "project", projectId] as const,
};

export function useNotifications() {
  return useQuery({
    queryKey: notificationKeys.all,
    queryFn: () => notificationService.getAll(),
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount,
    queryFn: () => notificationService.getUnreadCount(),
  });
}

export function useMarkAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: notificationKeys.all });

      const previous = qc.getQueryData<Notification[]>(notificationKeys.all);
      qc.setQueryData<Notification[]>(notificationKeys.all, (old) =>
        old?.map((n) => (n.id === id ? { ...n, read: true } : n))
      );

      const previousCount = qc.getQueryData<number>(notificationKeys.unreadCount);
      qc.setQueryData<number>(notificationKeys.unreadCount, (old) =>
        Math.max((old ?? 1) - 1, 0)
      );

      return { previous, previousCount };
    },
    onError: (_, __, context) => {
      if (context?.previous) {
        qc.setQueryData(notificationKeys.all, context.previous);
      }
      if (context?.previousCount !== undefined) {
        qc.setQueryData(notificationKeys.unreadCount, context.previousCount);
      }
    },
  });
}

export function useMarkAllAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: notificationKeys.all });

      const previous = qc.getQueryData<Notification[]>(notificationKeys.all);
      qc.setQueryData<Notification[]>(notificationKeys.all, (old) =>
        old?.map((n) => ({ ...n, read: true }))
      );

      const previousCount = qc.getQueryData<number>(notificationKeys.unreadCount);
      qc.setQueryData<number>(notificationKeys.unreadCount, () => 0);

      return { previous, previousCount };
    },
    onError: (_, __, context) => {
      if (context?.previous) {
        qc.setQueryData(notificationKeys.all, context.previous);
      }
      if (context?.previousCount !== undefined) {
        qc.setQueryData(notificationKeys.unreadCount, context.previousCount);
      }
    },
  });
}

export function useProjectNotifications(projectId: string) {
  return useQuery({
    queryKey: notificationKeys.byProject(projectId),
    queryFn: () => notificationService.getByProject(projectId),
    enabled: !!projectId,
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.all });
      qc.invalidateQueries({ queryKey: notificationKeys.unreadCount });
    },
  });
}

export function useClearAllNotifications() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.clearAll(),
    onSuccess: () => {
      qc.setQueryData<Notification[]>(notificationKeys.all, []);
      qc.setQueryData<number>(notificationKeys.unreadCount, 0);
    },
  });
}
