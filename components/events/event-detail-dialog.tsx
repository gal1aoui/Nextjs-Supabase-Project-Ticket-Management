"use client";

import { format } from "date-fns";
import { Calendar, Check, Edit, MapPin, Trash2, Users, Video, X } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUser } from "@/hooks/use-user";
import { getUserInitials } from "@/lib/helpers";
import { useDeleteEvent, useUpdateAttendeeStatus } from "@/stores/event.store";
import { EVENT_TYPE_LABELS, type EventWithRelations } from "@/types/event";

interface EventDetailDialogProps {
  event: EventWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (event: EventWithRelations) => void;
}

export function EventDetailDialog({
  event,
  open,
  onOpenChange,
  onEdit,
}: EventDetailDialogProps) {
  const { data: user } = useUser();
  const deleteEvent = useDeleteEvent();
  const updateStatus = useUpdateAttendeeStatus();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  if (!event) return null;

  const userAttendee = event.attendees.find((a) => a.user_id === user?.id);
  const isCreator = event.created_by === user?.id;

  const handleDelete = async () => {
    try {
      await deleteEvent.mutateAsync(event.id);
      toast.success("Event deleted successfully");
      setDeleteDialogOpen(false);
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to delete event");
      console.error(error);
    }
  };

  const handleStatusUpdate = async (status: "accepted" | "declined" | "tentative") => {
    if (!user) return;

    try {
      await updateStatus.mutateAsync({
        event_id: event.id,
        user_id: user.id,
        status,
      });
      toast.success(`Event ${status}`);
    } catch (error) {
      toast.error("Failed to update status");
      console.error(error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      accepted: "default",
      declined: "destructive",
      tentative: "secondary",
      invited: "outline",
    };
    return variants[status] || "outline";
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <DialogTitle className="text-2xl">{event.title}</DialogTitle>
                  {event.event_type !== "meeting" && (
                    <Badge variant="secondary">{EVENT_TYPE_LABELS[event.event_type]}</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(new Date(event.start_time), "PPP")} •{" "}
                    {format(new Date(event.start_time), "p")} -{" "}
                    {format(new Date(event.end_time), "p")}
                  </span>
                </div>
              </div>
              {isCreator && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      onOpenChange(false);
                      onEdit?.(event);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => setDeleteDialogOpen(true)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              )}
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {/* Project info */}
            {event.project && (
              <div className="flex items-center gap-2">
                <Badge variant="outline">{event.project.name}</Badge>
              </div>
            )}

            {/* Description */}
            {event.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            )}

            {/* Location */}
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{event.location}</span>
              </div>
            )}

            {/* Event URL */}
            {event.event_url && (
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-muted-foreground" />
                <a
                  href={event.event_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Join Video Call
                </a>
              </div>
            )}

            {/* Response Buttons */}
            {userAttendee && !isCreator && (
              <div className="flex gap-2 pt-2 border-t">
                <Button
                  size="sm"
                  variant={userAttendee.status === "accepted" ? "default" : "outline"}
                  onClick={() => handleStatusUpdate("accepted")}
                  className="flex-1"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant={userAttendee.status === "tentative" ? "default" : "outline"}
                  onClick={() => handleStatusUpdate("tentative")}
                  className="flex-1"
                >
                  Maybe
                </Button>
                <Button
                  size="sm"
                  variant={userAttendee.status === "declined" ? "destructive" : "outline"}
                  onClick={() => handleStatusUpdate("declined")}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Decline
                </Button>
              </div>
            )}

            {/* Attendees */}
            {event.attendees.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Attendees ({event.attendees.length})
                </h3>
                <div className="space-y-2">
                  {event.attendees.map((attendee) => (
                    <div
                      key={attendee.id}
                      className="flex items-center justify-between p-2 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={attendee.profile.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {getUserInitials(attendee.profile.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{attendee.profile.full_name}</div>
                          <div className="text-xs text-muted-foreground">
                            @{attendee.profile.username}
                          </div>
                        </div>
                      </div>
                      <Badge variant={getStatusBadge(attendee.status)}>{attendee.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Creator Info */}
            {event.creator && (
              <div className="text-xs text-muted-foreground border-t pt-3">
                Created by {event.creator.full_name} on{" "}
                {format(new Date(event.created_at), "PPP")}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this event? This action cannot be undone and all
              attendees will be notified.
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
