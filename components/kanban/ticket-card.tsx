"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { TicketPriority } from "@/types/ticket-priority";
import type { Ticket } from "@/types/ticket";
import UserAvatar from "../UserAvatar";
import { getContrastColor } from "@/lib/utils";

interface TicketCardProps {
  ticket: Ticket;
  priority?: TicketPriority;
  assigneeInitials?: string;
  onclick?: () => void;
}

export function TicketCard({ ticket, priority, onclick }: TicketCardProps) {
  return (
    <Card onClick={onclick} className="hover:bg-accent gap-2 p-2 transition-all duration-200">
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
