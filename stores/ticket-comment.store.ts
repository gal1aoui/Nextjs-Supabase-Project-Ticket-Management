import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ticketCommentService } from "@/services/ticket-comment.service";
import type {
  TicketCommentCreate,
  TicketCommentUpdate,
  TicketCommentWithAuthor,
} from "@/types/ticket-comment";

export const ticketCommentKeys = {
  byTicket: (ticketId: string) => ["ticket-comments", ticketId] as const,
};

export function useTicketComments(ticketId: string) {
  return useQuery({
    queryKey: ticketCommentKeys.byTicket(ticketId),
    queryFn: () => ticketCommentService.getByTicket(ticketId) as Promise<TicketCommentWithAuthor[]>,
    enabled: !!ticketId,
  });
}

export function useCreateComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TicketCommentCreate) => ticketCommentService.create(data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ticketCommentKeys.byTicket(variables.ticket_id) });
    },
  });
}

export function useUpdateComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TicketCommentUpdate & { ticketId: string }) =>
      ticketCommentService.update({ id: data.id, content: data.content }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ticketCommentKeys.byTicket(variables.ticketId) });
    },
  });
}

export function useDeleteComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; ticketId: string }) =>
      ticketCommentService.delete(params.id),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ticketCommentKeys.byTicket(variables.ticketId) });
    },
  });
}
