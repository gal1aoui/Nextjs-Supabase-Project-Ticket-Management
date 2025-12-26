import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AttendeeUpdate, MeetingCreate, MeetingUpdate } from "@/lib/utils";
import { meetingService } from "@/services/meeting.service";

export const meetingKeys = {
  byProject: (projectId: string) => ["meetings", projectId] as const,
  byDateRange: (projectId: string, start: Date, end: Date) =>
    ["meetings", projectId, start.toISOString(), end.toISOString()] as const,
  detail: (id: string) => ["meetings", "detail", id] as const,
};

export function useMeetings(projectId: string) {
  return useQuery({
    queryKey: meetingKeys.byProject(projectId),
    queryFn: () => meetingService.getByProject(projectId),
    enabled: !!projectId,
  });
}

export function useMeetingsByDateRange(projectId: string, startDate: Date, endDate: Date) {
  return useQuery({
    queryKey: meetingKeys.byDateRange(projectId, startDate, endDate),
    queryFn: () => meetingService.getByDateRange(projectId, startDate, endDate),
    enabled: !!projectId,
  });
}

export function useMeeting(id: string) {
  return useQuery({
    queryKey: meetingKeys.detail(id),
    queryFn: () => meetingService.getById(id),
    enabled: !!id,
  });
}

export function useCreateMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: MeetingCreate) => meetingService.create(data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: meetingKeys.byProject(variables.project_id) });
    },
  });
}

export function useUpdateMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: MeetingUpdate) => meetingService.update(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["meetings"] });
    },
  });
}

export function useDeleteMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => meetingService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["meetings"] });
    },
  });
}

export function useUpdateAttendeeStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AttendeeUpdate) => meetingService.updateAttendeeStatus(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["meetings"] });
    },
  });
}
