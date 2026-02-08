"use client";

import { useMemo, useState } from "react";
import { PermissionGate } from "@/components/permission-gate";
import { useTickets } from "@/stores/ticket.store";
import { useTicketPriorities } from "@/stores/ticket-priority.store";
import { useTicketStates } from "@/stores/ticket-state.store";
import type { Ticket } from "@/types/ticket";
import { ProjectKanbanSkeleton } from "../projects/project-detail/project-detail-skeleton";
import { Column } from "./column";
import { CreateTicketDialog } from "./create-ticket-dialog";
import { EditTicketDialog } from "./edit-ticket-dialog";
import { TicketDetailDialog } from "./ticket-detail-dialog";

interface KanbanBoardProps {
  projectId: string;
  userId: string;
}

export function KanbanBoard({ projectId, userId }: KanbanBoardProps) {
  const { data: tickets = [], isLoading: ticketsLoading } = useTickets(projectId);
  const { data: states = [], isLoading: statesLoading } = useTicketStates(projectId);
  const { data: priorities = [] } = useTicketPriorities(projectId);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);

  const ticketsByState = useMemo(() => {
    const grouped: Record<string, Ticket[]> = {};
    states.forEach((state) => {
      grouped[state.id] = tickets
        .filter((t) => t.state_id === state.id)
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    });
    return grouped;
  }, [tickets, states]);

  if (ticketsLoading || statesLoading) {
    return <ProjectKanbanSkeleton />;
  }

  const selectedState = states.find((s) => s.id === selectedTicket?.state_id);
  const selectedPriority = priorities.find((p) => p.id === selectedTicket?.priority_id);

  return (
    <>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Kanban Board</h2>
          <PermissionGate projectId={projectId} permission={["create_tickets", "manage_tickets"]}>
            <CreateTicketDialog
              projectId={projectId}
              states={states}
              priorities={priorities}
              userId={userId}
            />
          </PermissionGate>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {states.map((state) => (
            <Column
              key={state.id}
              state={state}
              tickets={ticketsByState[state.id] || []}
              priorities={priorities}
              onTicketClick={setSelectedTicket}
            />
          ))}
        </div>
      </div>

      <TicketDetailDialog
        ticket={selectedTicket}
        state={selectedState}
        priority={selectedPriority}
        open={!!selectedTicket}
        onOpenChange={(open) => !open && setSelectedTicket(null)}
        onEdit={(ticket) => {
          setSelectedTicket(null);
          setEditingTicket(ticket);
        }}
      />

      <EditTicketDialog
        ticket={editingTicket}
        states={states}
        priorities={priorities}
        open={!!editingTicket}
        onOpenChange={(open) => !open && setEditingTicket(null)}
      />
    </>
  );
}
