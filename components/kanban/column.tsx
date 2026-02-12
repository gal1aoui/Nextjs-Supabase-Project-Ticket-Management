"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Ticket } from "@/types/ticket";
import type { TicketPriority } from "@/types/ticket-priority";
import type { TicketState } from "@/types/ticket-state";
import { TicketCard } from "./ticket-card";

interface ColumnProps {
  state: TicketState;
  tickets: Ticket[];
  priorities: TicketPriority[];
  onTicketClick?: (ticket: Ticket) => void;
}

export function Column({ state, tickets, priorities, onTicketClick }: ColumnProps) {
  return (
    <Card className="relative flex flex-col">
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
