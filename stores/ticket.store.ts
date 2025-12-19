import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ticketService } from "@/services/ticket.service";
import type { TicketCreate, TicketUpdate } from "@/types/ticket";

export const ticketKeys = {
  byProject: (projectId: string) => ["tickets", projectId] as const,
  detail: (id: string) => ["tickets", "detail", id] as const,
};

export function useTickets(projectId: string) {
  return useQuery({
    queryKey: ticketKeys.byProject(projectId),
    queryFn: () => ticketService.getByProject(projectId),
    enabled: !!projectId,
  });
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: ticketKeys.detail(id),
    queryFn: () => ticketService.getById(id),
    enabled: !!id,
  });
}

export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TicketCreate) => ticketService.create(data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ticketKeys.byProject(variables.project_id) });
    },
  });
}

export function useUpdateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TicketUpdate) => ticketService.update(data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ticketKeys.byProject(data.project_id) });
      qc.invalidateQueries({ queryKey: ticketKeys.detail(data.id) });
    },
  });
}

export function useDeleteTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ticketService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
}
