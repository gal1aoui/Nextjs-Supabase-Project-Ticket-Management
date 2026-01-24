"use client";

import { useDroppable } from "@/contexts/drag-drop-context";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropOverlay } from "@/components/ui/drop-indicator";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Ticket, TicketPriority, TicketState } from "@/types/database";
import { TicketCard } from "./ticket-card";

interface ColumnProps {
  state: TicketState;
  tickets: Ticket[];
  priorities: TicketPriority[];
  onTicketClick?: (ticket: Ticket) => void;
  onTicketDrop?: (ticketId: string, newStateId: string) => void;
}

export function Column({ state, tickets, priorities, onTicketClick, onTicketDrop }: ColumnProps) {
  const { isOver, droppableProps } = useDroppable<Ticket>({
    id: state.id,
    accept: "ticket",
    onDrop: (ticket) => {
      if (ticket.state_id !== state.id) {
        onTicketDrop?.(ticket.id, state.id);
      }
    },
  });

  return (
    <Card
      {...droppableProps}
      className={`relative flex flex-col transition-all duration-200 ${
        isOver ? "scale-[1.02]" : ""
      }`}
    >
      <DropOverlay isOver={isOver} color="blue" />
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm font-medium">
          <div className="flex items-center gap-2">
            {state.color && (
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: state.color }} />
            )}
            <span>{state.name}</span>
          </div>
          <Badge variant="secondary" className="ml-auto">
            {tickets.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-3 pt-0">
        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="space-y-2">
            {tickets.map((ticket) => {
              const priority = priorities.find((p) => p.id === ticket.priority_id);
              return (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  priority={priority}
                  assigneeInitials="AC"
                  onclick={() => onTicketClick?.(ticket)}
                />
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
