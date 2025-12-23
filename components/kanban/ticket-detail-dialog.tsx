"use client";

import { Calendar, Edit, Trash2, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { dateFormatter } from "@/lib/helpers";
import { useDeleteTicket } from "@/stores/ticket.store";
import type { Ticket, TicketPriority, TicketState } from "@/types/database";

interface TicketDetailDialogProps {
  ticket: Ticket | null;
  state?: TicketState;
  priority?: TicketPriority;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (ticket: Ticket) => void;
}

export function TicketDetailDialog({
  ticket,
  state,
  priority,
  open,
  onOpenChange,
  onEdit,
}: TicketDetailDialogProps) {
  const deleteTicket = useDeleteTicket();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    if (!ticket) return;

    try {
      await deleteTicket.mutateAsync(ticket.id);
      toast.success("Ticket deleted successfully");
      setDeleteDialogOpen(false);
      onOpenChange(false);
    } catch (_) {
      toast.error(`Failed to delete ticket: ${deleteTicket.error?.message}`);
    }
  };

  if (!ticket) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-2xl">{ticket.title}</DialogTitle>
                <DialogDescription className="flex items-center gap-2 mt-2">
                  <Calendar className="h-4 w-4" />
                  <span>Created {new Date(ticket.created_at).toLocaleDateString()}</span>
                </DialogDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    onOpenChange(false);
                    onEdit?.(ticket);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => setDeleteDialogOpen(true)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {/* Status and Priority */}
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

            {/* Description */}
            {ticket.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {ticket.description}
                </p>
              </div>
            )}

            {/* Assignee */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                Assigned To
              </h3>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">
                  JD
                </div>
                <span className="text-sm">{ticket.assigned_to}</span>
              </div>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-sm">{dateFormatter(ticket.created_at)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Updated</p>
                <p className="text-sm">{dateFormatter(ticket.updated_at)}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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

function getContrastColor(hexColor: string): string {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}
