import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type ReorderTicketParams, ticketService } from "@/services/ticket.service";
import type { Ticket, TicketCreate, TicketUpdate } from "@/types/ticket";

export const ticketKeys = {
  byProject: (projectId: string) => ["tickets", projectId] as const,
  detail: (id: string) => ["tickets", "detail", id] as const,
  backlog: (projectId: string) => ["tickets", "backlog", projectId] as const,
  bySprint: (projectId: string, sprintId: string) => ["tickets", "sprint", projectId, sprintId] as const,
};

export function useTickets(projectId: string) {
  return useQuery({
    queryKey: ticketKeys.byProject(projectId),
    queryFn: () => ticketService.getByProject(projectId) as Promise<Ticket[]>,
    enabled: !!projectId,
  });
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: ticketKeys.detail(id),
    queryFn: () => ticketService.getById(id) as Promise<Ticket>,
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

export function useBacklogTickets(projectId: string) {
  return useQuery({
    queryKey: ticketKeys.backlog(projectId),
    queryFn: () => ticketService.getBacklog(projectId) as Promise<Ticket[]>,
    enabled: !!projectId,
  });
}

export function useSprintTickets(projectId: string, sprintId: string) {
  return useQuery({
    queryKey: ticketKeys.bySprint(projectId, sprintId),
    queryFn: () => ticketService.getBySprint(projectId, sprintId) as Promise<Ticket[]>,
    enabled: !!projectId && !!sprintId,
  });
}

export function useAssignTicketToSprint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { ticketId: string; sprintId: string | null }) =>
      ticketService.assignToSprint(params.ticketId, params.sprintId),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ticketKeys.byProject(data.project_id) });
      qc.invalidateQueries({ queryKey: ticketKeys.backlog(data.project_id) });
      qc.invalidateQueries({ queryKey: ["tickets", "sprint"] });
    },
  });
}

export function useReorderTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: ReorderTicketParams) => ticketService.reorder(params),
    onMutate: async (params) => {
      await qc.cancelQueries({ queryKey: ["tickets"] });

      const queries = qc.getQueriesData<Ticket[]>({ queryKey: ["tickets"] });

      for (const [queryKey, tickets] of queries) {
        if (!tickets) continue;

        const ticket = tickets.find((t) => t.id === params.ticketId);
        if (!ticket) continue;

        const movedTicket: Ticket = {
          ...ticket,
          state_id: params.newStateId,
          sort_order: params.newSortOrder,
        };

        const otherTickets = tickets.filter((t) => t.id !== params.ticketId);
        const finalTickets = [...otherTickets, movedTicket];

        qc.setQueryData(queryKey, finalTickets);
        return { queryKey, previousTickets: tickets };
      }
    },
    onError: (_, __, context) => {
      // Rollback on error
      if (context?.queryKey && context?.previousTickets) {
        qc.setQueryData(context.queryKey, context.previousTickets);
      }
    },
    onSettled: (data) => {
      // Refetch to ensure consistency
      if (data) {
        qc.invalidateQueries({ queryKey: ticketKeys.byProject(data.project_id) });
      }
    },
  });
}
