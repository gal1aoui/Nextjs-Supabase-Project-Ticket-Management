"use client";

import { Calendar, Clock, Edit, Trash2, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PermissionGate } from "@/components/permission-gate";
import { CommentList } from "@/components/tickets/comments/comment-list";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { dateFormatter, getUserInitials } from "@/lib/helpers";
import { getContrastColor } from "@/lib/utils";
import { useProfile } from "@/stores/profile.store";
import { useDeleteTicket } from "@/stores/ticket.store";
import type { Ticket } from "@/types/ticket";
import type { TicketPriority } from "@/types/ticket-priority";
import type { TicketState } from "@/types/ticket-state";

interface TicketDetailContentProps {
  ticket: Ticket;
  state?: TicketState;
  priority?: TicketPriority;
  onEdit?: (ticket: Ticket) => void;
  onClose: () => void;
}

export function TicketDetailContent({
  ticket,
  state,
  priority,
  onEdit,
  onClose,
}: TicketDetailContentProps) {
  const deleteTicket = useDeleteTicket();
  const { data: assigneeProfile } = useProfile(ticket.assigned_to ?? "");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteTicket.mutateAsync(ticket.id);
      toast.success("Ticket deleted successfully");
      setDeleteDialogOpen(false);
      onClose();
    } catch (_) {
      toast.error(`Failed to delete ticket: ${deleteTicket.error?.message}`);
    }
  };

  return (
    <>
      <div className="space-y-5">
        {/* Status & Priority Badges */}
        <div className="flex gap-2 flex-wrap">
          {state && (
            <Badge
              variant="outline"
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
              style={{
                backgroundColor: priority.color || undefined,
                color: priority.color ? getContrastColor(priority.color) : undefined,
              }}
            >
              {priority.name}
            </Badge>
          )}
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold leading-tight">{ticket.title}</h2>

        {/* Description */}
        {ticket.description && (
          <div>
            <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider">
              Description
            </h3>
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
          </div>
        )}

        {/* Details Card */}
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-muted-foreground shrink-0" />
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

        {/* Actions */}
        <PermissionGate
          projectId={ticket.project_id}
          permission={["manage_tickets", "update_own_tickets"]}
        >
          <Separator />
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => {
                onClose();
                onEdit?.(ticket);
              }}
            >
              <Edit className="h-4 w-4 mr-1.5" />
              Edit
            </Button>
            <PermissionGate projectId={ticket.project_id} permission="manage_tickets">
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                Delete
              </Button>
            </PermissionGate>
          </div>
        </PermissionGate>

        {/* Comments */}
        <CommentList ticketId={ticket.id} projectId={ticket.project_id} />
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Ticket</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this ticket? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
