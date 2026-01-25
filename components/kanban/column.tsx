"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { TicketPriority, TicketState } from "@/types/database";
import type { Ticket } from "@/types/ticket";
import { TicketCard } from "./ticket-card";
import type { Edge } from "@/contexts/dnd/types";
import { useColumnDroppable } from "@/contexts/dnd/hooks/use-column-droppable";

interface ColumnProps {
  state: TicketState;
  tickets: Ticket[];
  priorities: TicketPriority[];
  onTicketClick?: (ticket: Ticket) => void;
  onTicketReorder?: (
    draggedTicket: Ticket,
    targetTicket: Ticket | null,
    targetStateId: string,
    edge: Edge | null
  ) => void;
}

function CardShadow({ height }: { height: number }) {
  return <div className="shrink-0 rounded-lg bg-slate-200 dark:bg-slate-700" style={{ height }} />;
}

export function Column({
  state,
  tickets,
  priorities,
  onTicketClick,
  onTicketReorder,
}: ColumnProps) {
  const { isCardOver, draggingRect, droppableProps } = useColumnDroppable<Ticket>({
    accept: "ticket",
    onDrop: (ticket) => {
      // Dropping on column (not on a card) - add to end
      onTicketReorder?.(ticket, null, state.id, null);
    },
  });

  return (
    <Card
      {...droppableProps}
      className={`relative flex flex-col transition-all duration-200 ${
        isCardOver ? "ring-2 ring-blue-500/50" : ""
      }`}
    >
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
          <div className="flex flex-col gap-2">
            {tickets.map((ticket) => {
              const priority = priorities.find((p) => p.id === ticket.priority_id);
              return (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  priority={priority}
                  assigneeInitials="AC"
                  onclick={() => onTicketClick?.(ticket)}
                  onReorder={(draggedTicket, edge) =>
                    onTicketReorder?.(draggedTicket, ticket, state.id, edge)
                  }
                />
              );
            })}
            {/* Shadow at end of column when dragging over column background */}
            {isCardOver && draggingRect && <CardShadow height={draggingRect.height} />}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
