import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ticketPriorityService } from "@/services/ticket-priority.service";
import type { ticketPriorityCreate, ticketPriorityUpdate } from "@/types/ticket-priority";

export const ticketPriorityKeys = {
  byProject: (projectId: string) => ["ticket-priorities", projectId] as const,
};

export function useTicketPriorities(projectId: string) {
  return useQuery({
    queryKey: ticketPriorityKeys.byProject(projectId),
    queryFn: () => ticketPriorityService.getByProject(projectId),
    enabled: !!projectId,
  });
}

export function useCreateTicketPriority() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ticketPriorityCreate) => ticketPriorityService.create(data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ticketPriorityKeys.byProject(variables.project_id) });
    },
  });
}

export function useUpdateTicketPriority() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ticketPriorityUpdate) => ticketPriorityService.update(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ticket-priorities"] });
    },
  });
}

export function useDeleteTicketPriority() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ticketPriorityService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ticket-priorities"] });
    },
  });
}
