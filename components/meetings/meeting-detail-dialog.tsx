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
import type { MeetingWithRelations } from "@/lib/utils";
import { useDeleteMeeting, useUpdateAttendeeStatus } from "@/stores/meeting.store";

interface MeetingDetailDialogProps {
  meeting: MeetingWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (meeting: MeetingWithRelations) => void;
}

export function MeetingDetailDialog({
  meeting,
  open,
  onOpenChange,
  onEdit,
}: MeetingDetailDialogProps) {
  const { data: user } = useUser();
  const deleteMeeting = useDeleteMeeting();
  const updateStatus = useUpdateAttendeeStatus();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  if (!meeting) return null;

  const userAttendee = meeting.attendees.find((a) => a.user_id === user?.id);
  const isCreator = meeting.created_by === user?.id;

  const handleDelete = async () => {
    try {
      await deleteMeeting.mutateAsync(meeting.id);
      toast.success("Meeting deleted successfully");
      setDeleteDialogOpen(false);
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to delete meeting");
      console.error(error);
    }
  };

  const handleStatusUpdate = async (status: "accepted" | "declined" | "tentative") => {
    if (!user) return;

    try {
      await updateStatus.mutateAsync({
        meeting_id: meeting.id,
        user_id: user.id,
        status,
      });
      toast.success(`Meeting ${status}`);
    } catch (error) {
      toast.error("Failed to update status");
      console.error(error);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
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
                <DialogTitle className="text-2xl mb-2">{meeting.title}</DialogTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(new Date(meeting.start_time), "PPP")} •{" "}
                    {format(new Date(meeting.start_time), "p")} -{" "}
                    {format(new Date(meeting.end_time), "p")}
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
                      onEdit?.(meeting);
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
            {/* Description */}
            {meeting.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {meeting.description}
                </p>
              </div>
            )}

            {/* Location */}
            {meeting.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{meeting.location}</span>
              </div>
            )}

            {/* Meeting URL */}
            {meeting.meeting_url && (
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-muted-foreground" />
                <a
                  href={meeting.meeting_url}
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
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Attendees ({meeting.attendees.length})
              </h3>
              <div className="space-y-2">
                {meeting.attendees.map((attendee) => (
                  <div
                    key={attendee.id}
                    className="flex items-center justify-between p-2 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={attendee.profile.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {getInitials(attendee.profile.full_name)}
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

            {/* Creator Info */}
            {meeting.creator && (
              <div className="text-xs text-muted-foreground border-t pt-3">
                Created by {meeting.creator.full_name} on{" "}
                {format(new Date(meeting.created_at), "PPP")}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Meeting</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this meeting? This action cannot be undone and all
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
