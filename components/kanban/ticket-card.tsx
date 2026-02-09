"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getUserInitials } from "@/lib/helpers";
import { getContrastColor } from "@/lib/utils";
import { useProfile } from "@/stores/profile.store";
import type { Ticket } from "@/types/ticket";
import type { TicketPriority } from "@/types/ticket-priority";

interface TicketCardProps {
  ticket: Ticket;
  priority?: TicketPriority;
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
        <AssigneeAvatar userId={ticket.assigned_to} />
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

function AssigneeAvatar({ userId }: { userId: string | null }) {
  const { data: profile } = useProfile(userId ?? "");

  if (!userId) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Avatar className="h-6 w-6">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="text-[10px] bg-primary text-primary-foreground">
              {getUserInitials(profile?.full_name ?? null)}
            </AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <TooltipContent>
          <p>{profile?.full_name || "Loading..."}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
