import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ticketPriorityService } from "@/services/ticket-priority.service";
import type { TicketPriorityFormSchema, TicketPriorityUpdateSchema } from "@/types/ticket-priority";

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

export function useCreateTicketPriority(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TicketPriorityFormSchema) => ticketPriorityService.create(data, projectId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ticketPriorityKeys.byProject(projectId) });
    },
  });
}

export function useUpdateTicketPriority() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TicketPriorityUpdateSchema) => ticketPriorityService.update(data),
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
