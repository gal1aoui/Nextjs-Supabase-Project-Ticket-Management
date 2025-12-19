import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ticketStateService } from "@/services/ticket-state.service";
import type { TicketStateCreate, TicketStateUpdate } from "@/types/ticket-state";

export const ticketStateKeys = {
  byProject: (projectId: string) => ["ticket-states", projectId] as const,
};

export function useTicketStates(projectId: string) {
  return useQuery({
    queryKey: ticketStateKeys.byProject(projectId),
    queryFn: () => ticketStateService.getByProject(projectId),
    enabled: !!projectId,
  });
}

export function useCreateTicketState() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TicketStateCreate) => ticketStateService.create(data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ticketStateKeys.byProject(variables.project_id) });
    },
  });
}

export function useUpdateTicketState() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TicketStateUpdate) => ticketStateService.update(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ticket-states"] });
    },
  });
}

export function useDeleteTicketState() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ticketStateService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ticket-states"] });
    },
  });
}
