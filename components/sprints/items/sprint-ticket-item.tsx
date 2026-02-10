import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getUserInitials } from "@/lib/helpers";
import { getContrastColor } from "@/lib/utils";
import { useProfile } from "@/stores/profile.store";
import { useAssignTicketToSprint } from "@/stores/ticket.store";
import type { Ticket } from "@/types/ticket";

interface SprintTicketItemProps {
  ticket: Ticket;
  priority?: { name: string; color: string | null };
  canManage: boolean;
  onClick: () => void;
}

export default function SprintTicketItem({
  ticket,
  priority,
  canManage,
  onClick,
}: Readonly<SprintTicketItemProps>) {
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
      <div className="flex-1 min-w-0" onPointerUp={onClick}>
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
