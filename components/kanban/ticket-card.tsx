"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { TicketPriority } from "@/types/database";
import type { Ticket } from "@/types/ticket";
import UserAvatar from "../UserAvatar";
import type { Edge } from "@/contexts/dnd/types";
import { useDraggable } from "@/contexts/dnd/hooks/use-draggable";
import useCardDroppable from "@/contexts/dnd/hooks/use-card-droppable";
import { getContrastColor } from "@/contexts/dnd/utils";

interface TicketCardProps {
  ticket: Ticket;
  priority?: TicketPriority;
  assigneeInitials?: string;
  onclick?: () => void;
  onReorder?: (draggedTicket: Ticket, edge: Edge) => void;
}

// Shadow placeholder that takes the space of the dragged card
function CardShadow({ height }: { height: number }) {
  return <div className="shrink-0 rounded-lg bg-slate-200 dark:bg-slate-700" style={{ height }} />;
}

export function TicketCard({ ticket, priority, onclick, onReorder }: TicketCardProps) {
  const { draggableProps } = useDraggable({
    type: "ticket",
    item: ticket,
  });

  const { isOver, closestEdge, draggingRect, isDraggingThis, hasLeftSelf, droppableProps } =
    useCardDroppable<Ticket>({
      id: `ticket-${ticket.id}`,
      accept: "ticket",
      item: ticket,
      onDrop: (draggedTicket, edge) => {
        if (draggedTicket.id !== ticket.id) {
          onReorder?.(draggedTicket, edge);
        }
      },
    });

  // When this card has been dragged away from itself, hide it to make room for shadow
  const outerClassName = hasLeftSelf ? "hidden" : "flex flex-col gap-2";

  // Visual feedback when dragging this card
  const cardClassName = `
    cursor-grab active:cursor-grabbing hover:bg-accent gap-2 p-2 transition-all duration-200
    ${isDraggingThis && !hasLeftSelf ? "opacity-40" : ""}
  `.trim();

  return (
    <div className={outerClassName}>
      {/* Shadow before the card when dragging over top edge */}
      {isOver && closestEdge === "top" && draggingRect && (
        <CardShadow height={draggingRect.height} />
      )}

      <Card {...draggableProps} {...droppableProps} onClick={onclick} className={cardClassName}>
        <CardHeader className="flex items-center justify-between p-0">
          {priority && (
            <Badge
              variant="secondary"
              className="text-xs"
              style={{
                backgroundColor: priority.color || undefined,
                color: priority.color ? getContrastColor(priority.color) : undefined,
              }}
            >
              {priority.name}
            </Badge>
          )}
          <UserAvatar />
        </CardHeader>
        <div className="space-y-2">
          <CardTitle>{ticket.title}</CardTitle>
          <CardDescription className="p-1 line-clamp-2 wrap-break-word">
            {ticket.description}
          </CardDescription>
        </div>
      </Card>

      {/* Shadow after the card when dragging over bottom edge */}
      {isOver && closestEdge === "bottom" && draggingRect && (
        <CardShadow height={draggingRect.height} />
      )}
    </div>
  );
}
