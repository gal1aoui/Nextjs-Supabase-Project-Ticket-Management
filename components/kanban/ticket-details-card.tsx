import { Calendar, Clock, UserPen, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { dateFormatter, getUserInitials } from "@/lib/helpers";
import type { Profile } from "@/types/profile";
import type { Ticket } from "@/types/ticket";

export default function TicketDetailsCard({
  ticket,
  createdByProfile,
  assigneeProfile,
}: {
  ticket: Ticket;
  createdByProfile: Profile | undefined;
  assigneeProfile: Profile | undefined;
}) {
  return (
    <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
      <div className="flex items-center gap-3">
        <UserPen className="h-4 w-4 text-muted-foreground shrink-0" />
        {ticket.created_by && createdByProfile && (
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5">
              <AvatarImage src={createdByProfile.avatar_url || undefined} />
              <AvatarFallback className="text-[8px]">
                {getUserInitials(createdByProfile.full_name ?? null)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">{createdByProfile.full_name}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <UserPlus className="h-4 w-4 text-muted-foreground shrink-0" />
        {ticket.assigned_to && assigneeProfile ? (
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5">
              <AvatarImage src={assigneeProfile.avatar_url || undefined} />
              <AvatarFallback className="text-[8px]">
                {getUserInitials(assigneeProfile.full_name ?? null)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">{assigneeProfile.full_name}</span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">Unassigned</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-sm">Created {dateFormatter(ticket.created_at)}</span>
      </div>
      <div className="flex items-center gap-3">
        <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-sm">Updated {dateFormatter(ticket.updated_at)}</span>
      </div>
    </div>
  );
}
