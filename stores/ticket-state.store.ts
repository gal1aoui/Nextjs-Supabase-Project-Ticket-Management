import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ticketStateService } from "@/services/ticket-state.service";
import type { TicketStateFormSchema, TicketStateUpdateSchema } from "@/types/ticket-state";

export const ticketStateKeys = {
  byProject: (projectId: string) => ["ticket-states", projectId] as const,
  defaults: ["ticket-states", "defaults"] as const,
};

export function useTicketStates(projectId: string) {
  return useQuery({
    queryKey: ticketStateKeys.byProject(projectId),
    queryFn: () => ticketStateService.getByProject(projectId),
    enabled: !!projectId,
  });
}

export function useDefaultTicketStates() {
  return useQuery({
    queryKey: ticketStateKeys.defaults,
    queryFn: () => ticketStateService.getDefaults(),
  });
}

export function useCreateTicketState(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TicketStateFormSchema) => ticketStateService.create(data, projectId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ticketStateKeys.byProject(projectId) });
    },
  });
}

export function useUpdateTicketState() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TicketStateUpdateSchema) => ticketStateService.update(data),
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
