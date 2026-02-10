import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getUserInitials } from "@/lib/helpers";
import { getContrastColor } from "@/lib/utils";
import { useProfile } from "@/stores/profile.store";
import { useAssignTicketToSprint } from "@/stores/ticket.store";
import type { Sprint } from "@/types/sprint";
import type { Ticket } from "@/types/ticket";

interface BacklogTicketItemProps {
  ticket: Ticket;
  state?: { name: string; color: string | null };
  priority?: { name: string; color: string | null };
  availableSprints: Sprint[];
  canManage: boolean;
  onClick: () => void;
}

export default function BacklogTicketItem({
  ticket,
  state,
  priority,
  availableSprints,
  canManage,
  onClick,
}: Readonly<BacklogTicketItemProps>) {
  const assignToSprint = useAssignTicketToSprint();
  const { data: assignee } = useProfile(ticket.assigned_to ?? "");

  const handleMoveToSprint = async (sprintId: string) => {
    try {
      await assignToSprint.mutateAsync({ ticketId: ticket.id, sprintId });
      toast.success("Ticket moved to sprint");
    } catch (_) {
      toast.error("Failed to move ticket");
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 rounded-md border hover:bg-accent/50 transition-colors">
      <div className="flex-1 min-w-0" onPointerUp={onClick}>
        <div className="flex items-center gap-2">
          {state && (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0"
              style={{
                backgroundColor: state.color || undefined,
                color: state.color ? getContrastColor(state.color) : undefined,
              }}
            >
              {state.name}
            </Badge>
          )}
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
        </div>
        <p className="text-sm font-medium truncate mt-1">{ticket.title}</p>
      </div>

      {ticket.assigned_to && assignee && (
        <Avatar className="h-5 w-5 shrink-0">
          <AvatarImage src={assignee.avatar_url || undefined} />
          <AvatarFallback className="text-[8px]">
            {getUserInitials(assignee.full_name ?? null)}
          </AvatarFallback>
        </Avatar>
      )}

      {canManage && availableSprints.length > 0 && (
        <Select onValueChange={handleMoveToSprint}>
          <SelectTrigger className="w-auto h-7 text-xs gap-1 px-2">
            <ArrowRight className="h-3 w-3" />
            <SelectValue placeholder="Move" />
          </SelectTrigger>
          <SelectContent>
            {availableSprints.map((sprint) => (
              <SelectItem key={sprint.id} value={sprint.id}>
                {sprint.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
