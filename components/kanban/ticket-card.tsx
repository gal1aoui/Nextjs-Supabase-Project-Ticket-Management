"use client";

import { useDraggable } from "@/contexts/drag-drop-context";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Ticket, TicketPriority } from "@/types/database";
import UserAvatar from "../UserAvatar";

interface TicketCardProps {
  ticket: Ticket;
  priority?: TicketPriority;
  assigneeInitials?: string;
  onclick?: () => void;
}

export function TicketCard({ ticket, priority, onclick }: TicketCardProps) {
  const { draggableProps } = useDraggable({
    type: "ticket",
    item: ticket,
  });

  return (
    <Card
      {...draggableProps}
      onClick={onclick}
      className="cursor-grab active:cursor-grabbing hover:bg-accent gap-2 p-2 transition-all duration-200 active:opacity-50 active:scale-[0.98]"
    >
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
  );
}

function getContrastColor(hexColor: string): string {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}
