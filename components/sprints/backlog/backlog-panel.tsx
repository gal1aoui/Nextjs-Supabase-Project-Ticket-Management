"use client";

import { Inbox } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDrawer } from "@/contexts/drawer/drawer-context";
import { useBacklogTickets } from "@/stores/ticket.store";
import { useTicketPriorities } from "@/stores/ticket-priority.store";
import { useTicketStates } from "@/stores/ticket-state.store";
import type { Sprint } from "@/types/sprint";
import type { Ticket } from "@/types/ticket";
import { EditTicketDialog } from "../../kanban/edit-ticket-dialog";
import { TicketDetailContent } from "../../kanban/ticket-detail-content";
import BacklogTicketItem from "./backlog-ticket-item";

interface BacklogPanelProps {
  projectId: string;
  sprints: Sprint[];
  canManage: boolean;
}

export function BacklogPanel({ projectId, sprints, canManage }: BacklogPanelProps) {
  const { data: backlogTickets = [], isLoading } = useBacklogTickets(projectId);
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

  const availableSprints = sprints.filter((s) => s.status !== "completed");

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Inbox className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Backlog</CardTitle>
              <Badge variant="outline">{backlogTickets.length}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
          ) : backlogTickets.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No tickets in backlog</p>
          ) : (
            <ScrollArea className="max-h-[400px]">
              <div className="space-y-2">
                {backlogTickets.map((ticket) => (
                  <BacklogTicketItem
                    key={ticket.id}
                    ticket={ticket}
                    state={states.find((s) => s.id === ticket.state_id)}
                    priority={priorities.find((p) => p.id === ticket.priority_id)}
                    availableSprints={availableSprints}
                    canManage={canManage}
                    onClick={() => handleTicketClick(ticket)}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
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
