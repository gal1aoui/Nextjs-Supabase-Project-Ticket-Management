"use client";

import { Plus } from "lucide-react";
import { useMemo } from "react";
import { PermissionGate } from "@/components/permission-gate";
import { Button } from "@/components/ui/button";
import { useDrawer } from "@/contexts/drawer/drawer-context";
import { useModal } from "@/contexts/modal/modal-context";
import { useTickets } from "@/stores/ticket.store";
import { useTicketPriorities } from "@/stores/ticket-priority.store";
import { useTicketStates } from "@/stores/ticket-state.store";
import type { Ticket } from "@/types/ticket";
import { ProjectKanbanSkeleton } from "../projects/project-detail/project-detail-skeleton";
import { Column } from "./column";
import { TicketForm } from "./forms/ticket-form";
import { TicketDetailContent } from "./ticket-detail-content";

interface KanbanBoardProps {
  projectId: string;
  userId: string;
}

export function KanbanBoard({ projectId, userId }: KanbanBoardProps) {
  const { data: tickets = [], isLoading: ticketsLoading } = useTickets(projectId);
  const { data: states = [], isLoading: statesLoading } = useTicketStates(projectId);
  const { data: priorities = [] } = useTicketPriorities(projectId);
  const { openDrawer } = useDrawer();
  const { openModal } = useModal();

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

  const handleTicketClick = (ticket: Ticket) => {
    const state = states.find((s) => s.id === ticket.state_id);
    const priority = priorities.find((p) => p.id === ticket.priority_id);
    openDrawer({
      title: ticket.title,
      render: ({ close }) => (
        <TicketDetailContent
          ticket={ticket}
          state={state}
          priority={priority}
          onClose={close}
          onEdit={(t) => {
            close();
            openModal({
              title: "Edit Ticket",
              description: "Update ticket information",
              render: ({ close }) => (
                <TicketForm
                  ticket={t}
                  projectId={projectId}
                  states={states}
                  priorities={priorities}
                  userId={userId}
                  closeModal={close}
                />
              ),
            });
          }}
        />
      ),
    });
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Kanban Board</h2>
        <PermissionGate projectId={projectId} permission={["create_tickets", "manage_tickets"]}>
          <Button
            onClick={() =>
              openModal({
                title: "Create New Ticket",
                description: "Add a new ticket to your project board",
                render: ({ close }) => (
                  <TicketForm
                    projectId={projectId}
                    states={states}
                    priorities={priorities}
                    userId={userId}
                    closeModal={close}
                  />
                ),
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </PermissionGate>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {states.map((state) => (
          <Column
            key={state.id}
            state={state}
            tickets={ticketsByState[state.id] || []}
            priorities={priorities}
            onTicketClick={handleTicketClick}
          />
        ))}
      </div>
    </div>
  );
}
