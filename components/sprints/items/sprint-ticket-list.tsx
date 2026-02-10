"use client";

import { Inbox } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDrawer } from "@/contexts/drawer/drawer-context";
import { useSprintTickets } from "@/stores/ticket.store";
import { useTicketPriorities } from "@/stores/ticket-priority.store";
import { useTicketStates } from "@/stores/ticket-state.store";
import type { Ticket } from "@/types/ticket";
import { EditTicketDialog } from "../../kanban/edit-ticket-dialog";
import { TicketDetailContent } from "../../kanban/ticket-detail-content";
import SprintTicketItem from "./sprint-ticket-item";

interface SprintTicketListProps {
  projectId: string;
  sprintId: string;
  canManage: boolean;
}

export function SprintTicketList({ projectId, sprintId, canManage }: SprintTicketListProps) {
  const { data: tickets = [], isLoading } = useSprintTickets(projectId, sprintId);
  const { data: states = [] } = useTicketStates(projectId);
  const { data: priorities = [] } = useTicketPriorities(projectId);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const { openDrawer } = useDrawer();

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
            setEditingTicket(t);
          }}
        />
      ),
    });
  };

  const ticketsByState = useMemo(() => {
    const grouped: Record<string, Ticket[]> = {};
    for (const state of states) {
      const stateTickets = tickets.filter((t) => t.state_id === state.id);
      if (stateTickets.length > 0) {
        grouped[state.id] = stateTickets;
      }
    }
    return grouped;
  }, [tickets, states]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>;
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Inbox className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No tickets in this sprint</p>
        <p className="text-xs mt-1">Move tickets from the backlog to get started</p>
      </div>
    );
  }

  return (
    <>
      <ScrollArea className="max-h-[500px]">
        <div className="space-y-4">
          {states.map((state) => {
            const stateTickets = ticketsByState[state.id];
            if (!stateTickets) return null;

            return (
              <div key={state.id}>
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: state.color || "#888" }}
                  />
                  <span className="text-sm font-medium">{state.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {stateTickets.length}
                  </Badge>
                </div>
                <div className="space-y-1.5 pl-4">
                  {stateTickets.map((ticket) => (
                    <SprintTicketItem
                      key={ticket.id}
                      ticket={ticket}
                      priority={priorities.find((p) => p.id === ticket.priority_id)}
                      canManage={canManage}
                      onClick={() => handleTicketClick(ticket)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
      <EditTicketDialog
        ticket={editingTicket}
        projectId={projectId}
        states={states}
        priorities={priorities}
        open={!!editingTicket}
        onOpenChange={(open) => !open && setEditingTicket(null)}
      />
    </>
  );
}
