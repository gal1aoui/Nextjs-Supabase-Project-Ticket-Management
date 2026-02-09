"use client";

import { ArrowLeft, Inbox } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDrawer } from "@/contexts/drawer/drawer-context";
import { getUserInitials } from "@/lib/helpers";
import { getContrastColor } from "@/lib/utils";
import { useProfile } from "@/stores/profile.store";
import { useAssignTicketToSprint, useSprintTickets } from "@/stores/ticket.store";
import { useTicketPriorities } from "@/stores/ticket-priority.store";
import { useTicketStates } from "@/stores/ticket-state.store";
import type { Ticket } from "@/types/ticket";
import type { TicketState } from "@/types/ticket-state";

interface SprintTicketListProps {
  projectId: string;
  sprintId: string;
  canManage: boolean;
}

export function SprintTicketList({ projectId, sprintId, canManage }: SprintTicketListProps) {
  const { data: tickets = [], isLoading } = useSprintTickets(projectId, sprintId);
  const { data: states = [] } = useTicketStates(projectId);
  const { data: priorities = [] } = useTicketPriorities(projectId);

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
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

function SprintTicketItem({
  ticket,
  priority,
  canManage,
}: {
  ticket: Ticket;
  priority?: { name: string; color: string | null };
  canManage: boolean;
}) {
  const assignToSprint = useAssignTicketToSprint();
  const { data: assignee } = useProfile(ticket.assigned_to ?? "");

  const handleMoveToBacklog = async () => {
    try {
      await assignToSprint.mutateAsync({ ticketId: ticket.id, sprintId: null });
      toast.success("Ticket moved to backlog");
    } catch (_) {
      toast.error("Failed to move ticket");
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 rounded-md border hover:bg-accent/50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {priority && (
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0"
              style={{
                backgroundColor: priority.color || undefined,
                color: priority.color ? getContrastColor(priority.color) : undefined,
              }}
            >
              {priority.name}
            </Badge>
          )}
          <span className="text-sm truncate">{ticket.title}</span>
        </div>
      </div>

      {ticket.assigned_to && assignee && (
        <Avatar className="h-5 w-5 shrink-0">
          <AvatarImage src={assignee.avatar_url || undefined} />
          <AvatarFallback className="text-[8px]">
            {getUserInitials(assignee.full_name ?? null)}
          </AvatarFallback>
        </Avatar>
      )}

      {canManage && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0"
          onClick={handleMoveToBacklog}
          title="Move to backlog"
        >
          <ArrowLeft className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
