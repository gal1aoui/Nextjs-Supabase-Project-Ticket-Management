"use client";

import { format } from "date-fns";
import {
  Calendar,
  CalendarRange,
  Check,
  Clock,
  Edit,
  MapPin,
  Trash2,
  Users,
  Video,
  X,
} from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/hooks/use-user";
import { getUserInitials } from "@/lib/helpers";
import { isMultiDayEvent } from "@/lib/utils";
import { useDeleteEvent, useUpdateAttendeeStatus } from "@/stores/event.store";
import { EVENT_TYPE_LABELS, type EventWithRelations } from "@/types/event";

interface EventDetailContentProps {
  event: EventWithRelations;
  onEdit?: (event: EventWithRelations) => void;
  onClose: () => void;
}

export function EventDetailContent({ event, onEdit, onClose }: EventDetailContentProps) {
  const { data: user } = useUser();
  const deleteEvent = useDeleteEvent();
  const updateStatus = useUpdateAttendeeStatus();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const userAttendee = event.attendees.find((a) => a.user_id === user?.id);
  const isCreator = event.created_by === user?.id;
  const multiDay = isMultiDayEvent(event);

  const handleDelete = async () => {
    try {
      await deleteEvent.mutateAsync(event.id);
      toast.success("Event deleted successfully");
      setDeleteDialogOpen(false);
      onClose();
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
      <div className="space-y-5">
        {/* Title & Type */}
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <Badge variant="secondary" className="text-xs">
              {EVENT_TYPE_LABELS[event.event_type]}
            </Badge>
            {event.project && (
              <Badge variant="outline" className="text-xs">
                {event.project.name}
              </Badge>
            )}
          </div>
          <h2 className="text-xl font-semibold leading-tight">{event.title}</h2>
        </div>

        {/* Date & Time Info */}
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
          <div className="flex items-center gap-3">
            {multiDay ? (
              <CalendarRange className="h-4 w-4 text-muted-foreground shrink-0" />
            ) : (
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
            <span className="text-sm font-medium">
              {multiDay
                ? `${format(new Date(event.start_date), "MMM d")} - ${format(new Date(event.end_date), "MMM d, yyyy")}`
                : format(new Date(event.start_date), "EEEE, MMMM d, yyyy")}
            </span>
          </div>
          {!multiDay && (
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm">
                {event.start_time.slice(0, 5)} - {event.end_time.slice(0, 5)}
              </span>
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm">{event.location}</span>
            </div>
          )}
          {event.event_url && (
            <div className="flex items-center gap-3">
              <Video className="h-4 w-4 text-muted-foreground shrink-0" />
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
        </div>

        {/* Description */}
        {event.description && (
          <div>
            <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider">
              Description
            </h3>
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{event.description}</p>
          </div>
        )}

        {/* Response Buttons */}
        {userAttendee && !isCreator && (
          <>
            <Separator />
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
                Your Response
              </h3>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={userAttendee.status === "accepted" ? "default" : "outline"}
                  onClick={() => handleStatusUpdate("accepted")}
                  className="flex-1"
                >
                  <Check className="h-4 w-4 mr-1.5" />
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
                  <X className="h-4 w-4 mr-1.5" />
                  Decline
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Attendees */}
        {event.attendees.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Users className="h-4 w-4" />
                Attendees ({event.attendees.length})
              </h3>
              <div className="space-y-1.5">
                {event.attendees.map((attendee) => (
                  <div
                    key={attendee.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30"
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
                    <Badge variant={getStatusBadge(attendee.status)} className="capitalize text-xs">
                      {attendee.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Actions */}
        {isCreator && (
          <>
            <Separator />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  onClose();
                  onEdit?.(event);
                }}
              >
                <Edit className="h-4 w-4 mr-1.5" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                Delete
              </Button>
            </div>
          </>
        )}

        {/* Creator Info */}
        {event.creator && (
          <p className="text-xs text-muted-foreground pt-2">
            Created by {event.creator.full_name} on {format(new Date(event.created_at), "PPP")}
          </p>
        )}
      </div>

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
