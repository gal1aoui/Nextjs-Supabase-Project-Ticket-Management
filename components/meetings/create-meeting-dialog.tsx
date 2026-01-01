"use client";

import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateMeeting } from "@/stores/meeting.store";
import { useProjectMembers } from "@/stores/project-member.store";
import MeetingAttendeesMemberCard from "./items/meeting-attendees-member-item";

interface CreateMeetingDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: Date;
}

export function CreateMeetingDialog({
  projectId,
  open,
  onOpenChange,
  defaultDate,
}: CreateMeetingDialogProps) {

  const createMeeting = useCreateMeeting();
  const { data: members = [] } = useProjectMembers(projectId);

  const activeMembers = members.filter((m) => m.status === "active");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !startTime || !endTime) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      await createMeeting.mutateAsync({
        project_id: projectId,
        title,
        description: description || undefined,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        location: location || undefined,
        meeting_url: meetingUrl || undefined,
        attendee_ids: selectedAttendees,
      });

      // Reset form
      setTitle("");
      setDescription("");
      setStartTime("");
      setEndTime("");
      setLocation("");
      setMeetingUrl("");
      setSelectedAttendees([]);
      onOpenChange(false);
      toast.success("Meeting created successfully");
    } catch (error) {
      toast.error("Failed to create meeting");
      console.error(error);
    }
  };

  const toggleAttendee = (userId: string) => {
    setSelectedAttendees((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Schedule Meeting</DialogTitle>
            <DialogDescription>Create a new meeting for your project team</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Sprint Planning Meeting"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Discuss sprint goals and assign tasks"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start-time">Start Time *</Label>
                <Input
                  id="start-time"
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end-time">End Time *</Label>
                <Input
                  id="end-time"
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Conference Room A"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="meeting-url">Meeting URL</Label>
              <Input
                id="meeting-url"
                type="url"
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                placeholder="https://meet.google.com/..."
              />
            </div>

            <div className="grid gap-2">
              <Label>Attendees ({selectedAttendees.length} selected)</Label>
              <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                {activeMembers.map((member) => (
                  <MeetingAttendeesMemberCard
                    key={member.user_id}
                    userId={member.user_id}
                    roleId={member.role_id}
                    includeAttendee={selectedAttendees.includes(member.user_id)}
                    toggleAttendee={() => toggleAttendee(member.user_id)}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMeeting.isPending}>
              {createMeeting.isPending ? "Creating..." : "Create Meeting"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
