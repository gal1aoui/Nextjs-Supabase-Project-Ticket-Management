"use client";

import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Ticket, TicketPriority, TicketState } from "@/types/database";
import { TicketCard } from "./ticket-card";

interface ColumnProps {
  state: TicketState;
  tickets: Ticket[];
  priorities: TicketPriority[];
  onTicketClick?: (ticket: Ticket) => void;
  onTicketDrop?: (ticketId: string, newStateId: string, destinationIndex?: number) => void;
}

export function Column({ state, tickets, priorities, onTicketClick, onTicketDrop }: ColumnProps) {
  const columnRef = useRef<HTMLDivElement>(null);
  const [isDraggedOver, setIsDraggedOver] = useState(false);

  useEffect(() => {
    const el = columnRef.current;
    if (!el) return;

    return combine(
      dropTargetForElements({
        element: el,
        getData: () => ({ stateId: state.id }),
        onDragEnter: () => setIsDraggedOver(true),
        onDragLeave: () => setIsDraggedOver(false),
        onDrop: ({ source }) => {
          setIsDraggedOver(false);
          const ticket = source.data.ticket as Ticket;
          if (ticket && ticket.state_id !== state.id) {
            onTicketDrop?.(ticket.id, state.id);
          }
        },
      })
    );
  }, [state.id, onTicketDrop]);

  return (
    <Card
      ref={columnRef}
      className={`flex flex-col transition-colors ${
        isDraggedOver ? "ring-2 ring-primary bg-accent/50" : ""
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
          <div className="space-y-2">
            {tickets.map((ticket) => {
              const priority = priorities.find((p) => p.id === ticket.priority_id);
              const handleActivate = () => onTicketClick?.(ticket);
              return (
                <button
                  key={ticket.id}
                  type="button"
                  onClick={handleActivate}
                  className="w-full text-left p-0 bg-transparent border-0"
                >
                  <TicketCard ticket={ticket} priority={priority} assigneeInitials="AC" />
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
