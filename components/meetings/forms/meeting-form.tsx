import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateMeeting } from "@/stores/meeting.store";
import { useProjectMembers } from "@/stores/project-member.store";
import type { MeetingFormSchema } from "@/types/meeting";
import MeetingAttendeesMemberCard from "../items/meeting-attendees-member-item";

interface MeetingFormProps {
  projectId: string;
  defaulMeetingDate: Date | undefined;
  closeModal: () => void;
}

export default function MeetingForm({
  projectId,
  defaulMeetingDate,
  closeModal,
}: MeetingFormProps) {
  const [form, setForm] = useState<Partial<MeetingFormSchema>>();
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);

  const createMeeting = useCreateMeeting();
  const { data: members = [] } = useProjectMembers(projectId);

  const activeMembers = members.filter((m) => m.status === "active");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form?.title || !form.startTime || !form.endTime) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      await createMeeting.mutateAsync({
        project_id: projectId,
        title: form.title,
        description: form.description || undefined,
        start_time: new Date(form.startTime).toISOString(),
        end_time: new Date(form.endTime).toISOString(),
        location: form.location || undefined,
        meeting_url: form.meetingUrl || undefined,
        attendee_ids: form.attendees,
      });

      closeModal();
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
    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={form?.title}
              onChange={(e) =>
                setForm((prev) => {
                  return { ...prev, title: e.target.value };
                })
              }
              placeholder="Sprint Planning Meeting"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form?.description}
              onChange={(e) =>
                setForm((prev) => {
                  return { ...prev, description: e.target.value };
                })
              }
              placeholder="Discuss sprint goals and assign tasks"
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="state">State *</Label>
            <Calendar
              mode="range"
              defaultMonth={form?.startDate || defaulMeetingDate}
              selected={{
                from: form?.startDate || defaulMeetingDate,
                to: form?.endDate || defaulMeetingDate,
              }}
              onSelect={(range) => {
                if (range?.from) {
                  setForm((prev) => {
                    return {
                      ...prev,
                      startDate: range.from,
                      endDate: range.to,
                    };
                  });
                }
              }}
              numberOfMonths={2}
              className="rounded-lg border shadow-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="start-time">Start Time *</Label>
              <Input
                id="start-time"
                type="datetime-local"
                value={form?.startTime}
                onChange={(e) =>
                  setForm((prev) => {
                    return { ...prev, startTime: e.target.value };
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end-time">End Time *</Label>
              <Input
                id="end-time"
                type="datetime-local"
                value={form?.endTime}
                onChange={(e) =>
                  setForm((prev) => {
                    return { ...prev, endTime: e.target.value };
                  })
                }
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <Select
              value={form?.location}
              onValueChange={(value) =>
                setForm((prev) => {
                  return { ...prev, endTime: value };
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="In-Person">In-Person</SelectItem>
                <SelectItem value="Online">Online</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {form?.location === "Online" && (
            <div className="grid gap-2">
              <Label htmlFor="meeting-url">Meeting URL</Label>
              <Input
                id="meeting-url"
                type="url"
                value={form?.meetingUrl}
                onChange={(e) =>
                  setForm((prev) => {
                    return { ...prev, meetingUrl: e.target.value };
                  })
                }
                placeholder="https://meet.google.com/..."
              />
            </div>
          )}

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
          <Button type="button" variant="outline" onClick={() => closeModal()}>
            Cancel
          </Button>
          <Button type="submit" disabled={createMeeting.isPending}>
            {createMeeting.isPending ? "Creating..." : "Create Meeting"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
