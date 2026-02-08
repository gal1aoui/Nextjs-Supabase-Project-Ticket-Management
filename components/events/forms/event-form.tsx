import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { DialogFooter } from "@/components/ui/dialog";
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
import { useCreateEvent } from "@/stores/event.store";
import { useProjectMembers } from "@/stores/project-member.store";
import { EVENT_TYPE_LABELS, EVENT_TYPES, type Event, type EventFormSchema, type EventType } from "@/types/event";
import EventAttendeesMemberItem from "../items/event-attendees-member-item";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { isWeekend } from "date-fns";

interface EventFormProps {
  projectId?: string;
  defaultEventDate: Date | undefined;
  closeModal: () => void;
}

export default function EventForm({
  projectId,
  defaultEventDate,
  closeModal,
}: EventFormProps) {
  const [form, setForm] = useState<EventFormSchema>({
    title: "",
    description: "",
    event_type: projectId ? "meeting" : "personal",
    start_date: defaultEventDate || new Date(),
    end_date: defaultEventDate || new Date(),
    start_time: "00:00:00",
    end_time: "12:00:00",
    location: "In-Person",
    event_url: "",
    attendees: [],
  });
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);

  const createEvent = useCreateEvent();
  const { data: members = [] } = useProjectMembers(projectId ?? "");

  const activeMembers = members.filter((m) => m.status === "active");
  const isProjectEvent = !!projectId;
  const isMeetingType = form.event_type === "meeting";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form?.title || !form.start_time || !form.end_time) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      await createEvent.mutateAsync({
        project_id: projectId,
        title: form.title,
        description: form.description || undefined,
        event_type: form.event_type,
        start_time: form.start_time,
        end_time: form.end_time,
        start_date: form.start_date,
        end_date: form.end_date,
        location: form.location,
        event_url: form.event_url || undefined,
        attendees: isProjectEvent ? selectedAttendees : undefined,
      });

      closeModal();
      toast.success("Event created successfully");
    } catch (error) {
      toast.error("Failed to create event");
      console.error(error);
    }
  };

  const toggleAttendee = (userId: string) => {
    setSelectedAttendees((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        {/* Event Type - only show for personal events (no projectId) */}
        {!isProjectEvent && (
          <div className="grid gap-2">
            <Label htmlFor="event-type">Event Type</Label>
            <Select
              value={form.event_type}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, event_type: value as EventType }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.filter((t) => t !== "meeting").map((type) => (
                  <SelectItem key={type} value={type}>
                    {EVENT_TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="grid gap-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={form?.title}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder={isProjectEvent ? "Sprint Planning" : "Out of Office"}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={form?.description}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder={isProjectEvent ? "Discuss sprint goals and assign tasks" : "Add details about this event"}
            rows={3}
          />
        </div>

        <Card className="rounded-lg border mx-auto w-fit px-0">
          <CardContent>
            <Calendar
              mode="range"
              defaultMonth={defaultEventDate || form?.start_date}
              selected={{
                from: defaultEventDate || form?.start_date,
                to: defaultEventDate || form?.end_date,
              }}
              disabled={isWeekend}
              onSelect={(range) => {
                if (range?.from) {
                  setForm((prev) => ({
                    ...prev,
                    start_date: range.from,
                    end_date: range.to,
                  }));
                }
              }}
              numberOfMonths={2}
            />
          </CardContent>
          {form.start_date?.getDay() === form.end_date?.getDay() && (
            <CardFooter className="bg-card border-t grid grid-cols-2 gap-2">
              <div className="grid gap-2">
                <Label htmlFor="start-time">Start Time *</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={form?.start_time}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, start_time: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end-time">End Time *</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={form?.end_time}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, end_time: e.target.value }))
                  }
                />
              </div>
            </CardFooter>
          )}
        </Card>

        {/* Location & URL - show for meetings and project events */}
        {(isProjectEvent || isMeetingType) && (
          <>
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Select
                value={form?.location}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, location: value as Event["location"] }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="In-Person">In-Person</SelectItem>
                  <SelectItem value="Online">Online</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {form?.location === "Online" && (
              <div className="grid gap-2">
                <Label htmlFor="event-url">Event URL</Label>
                <Input
                  id="event-url"
                  type="url"
                  value={form?.event_url}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, event_url: e.target.value }))
                  }
                  placeholder="https://meet.google.com/..."
                />
              </div>
            )}
          </>
        )}

        {/* Attendees - only for project events */}
        {isProjectEvent && activeMembers.length > 0 && (
          <div className="grid gap-2">
            <Label>Attendees ({selectedAttendees.length} selected)</Label>
            <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
              {activeMembers.map((member) => (
                <EventAttendeesMemberItem
                  key={member.user_id}
                  userId={member.user_id}
                  roleId={member.role_id}
                  includeAttendee={selectedAttendees.includes(member.user_id)}
                  toggleAttendee={() => toggleAttendee(member.user_id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => closeModal()}>
          Cancel
        </Button>
        <Button type="submit" disabled={createEvent.isPending}>
          {createEvent.isPending ? "Creating..." : "Create Event"}
        </Button>
      </DialogFooter>
    </form>
  );
}
