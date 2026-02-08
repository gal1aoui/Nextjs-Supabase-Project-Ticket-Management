import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { eventService } from "@/services/event.service";
import type { EventAttendeeUpdate, EventCreate, EventUpdate } from "@/types/event";

export const eventKeys = {
  byProject: (projectId: string) => ["events", projectId] as const,
  byDateRange: (projectId: string, start: Date, end: Date) =>
    ["events", projectId, start.toISOString(), end.toISOString()] as const,
  byUserDateRange: (userId: string, start: Date, end: Date) =>
    ["events", "user", userId, start.toISOString(), end.toISOString()] as const,
  detail: (id: string) => ["events", "detail", id] as const,
};

export function useEvents(projectId: string) {
  return useQuery({
    queryKey: eventKeys.byProject(projectId),
    queryFn: () => eventService.getByProject(projectId),
    enabled: !!projectId,
  });
}

export function useEventsByDateRange(projectId: string, startDate: Date, endDate: Date) {
  return useQuery({
    queryKey: eventKeys.byDateRange(projectId, startDate, endDate),
    queryFn: () => eventService.getByDateRange(projectId, startDate, endDate),
    enabled: !!projectId,
  });
}

export function useUserEventsByDateRange(userId: string, startDate: Date, endDate: Date) {
  return useQuery({
    queryKey: eventKeys.byUserDateRange(userId, startDate, endDate),
    queryFn: () => eventService.getUserEventsByDateRange(userId, startDate, endDate),
    enabled: !!userId,
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => eventService.getById(id),
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: EventCreate) => eventService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useUpdateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: EventUpdate) => eventService.update(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eventService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useUpdateAttendeeStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: EventAttendeeUpdate) => eventService.updateAttendeeStatus(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] });
    },
  });
}
