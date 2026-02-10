import { isSameDay, isWeekend } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import { MemberPicker } from "@/components/members/member-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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
import {
  EVENT_TYPE_LABELS,
  EVENT_TYPES,
  type EventFormSchema,
  type EventType,
} from "@/types/event";

interface EventFormProps {
  projectId?: string;
  defaultEventDate: Date | undefined;
  closeModal: () => void;
}

export default function EventForm({ projectId, defaultEventDate, closeModal }: EventFormProps) {
  const [form, setForm] = useState<EventFormSchema>({
    title: "",
    description: "",
    event_type: projectId ? "meeting" : "personal",
    start_date: defaultEventDate || new Date(),
    end_date: defaultEventDate || new Date(),
    start_time: "09:00",
    end_time: "10:00",
    location: "In-Person",
    event_url: "",
    attendees: [],
  });
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);

  const createEvent = useCreateEvent();
  const isProjectEvent = !!projectId;

  const isSingleDay = form.start_date && form.end_date && isSameDay(form.start_date, form.end_date);

  // Event types available based on single vs multi-day
  const availableTypes = isProjectEvent
    ? EVENT_TYPES
    : EVENT_TYPES.filter((t) => (isSingleDay ? true : t !== "meeting"));

  const handleDateRangeChange = (range: { from?: Date; to?: Date } | undefined) => {
    if (!range?.from) return;

    const from = range.from;
    const to = range.to ?? from;
    const sameDay = isSameDay(from, to);

    setForm((prev) => {
      const updates: Partial<EventFormSchema> = {
        start_date: from,
        end_date: to,
      };

      // Multi-day: auto-set full day times, switch away from meeting type
      if (!sameDay) {
        updates.start_time = "00:00";
        updates.end_time = "23:59";
        if (prev.event_type === "meeting") {
          updates.event_type = isProjectEvent ? "holiday" : "personal";
        }
      }

      return { ...prev, ...updates };
    });
  };

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

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        {/* Event Type */}
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
              {availableTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {EVENT_TYPE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={form?.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            placeholder={isProjectEvent ? "Sprint Planning" : "Out of Office"}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={form?.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder={
              isProjectEvent
                ? "Discuss sprint goals and assign tasks"
                : "Add details about this event"
            }
            rows={3}
          />
        </div>

        <Card className="rounded-lg border mx-auto w-fit px-0">
          <CardContent>
            <Calendar
              mode="range"
              defaultMonth={form?.start_date}
              selected={{
                from: form?.start_date,
                to: form?.end_date,
              }}
              disabled={isWeekend}
              onSelect={handleDateRangeChange}
              numberOfMonths={2}
            />
          </CardContent>
          {isSingleDay && (
            <CardFooter className="bg-card border-t grid grid-cols-2 gap-2">
              <div className="grid gap-2">
                <Label htmlFor="start-time">Start Time *</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={form?.start_time}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      start_time: e.target.value,
                    }))
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
                    setForm((prev) => ({
                      ...prev,
                      end_time: e.target.value,
                    }))
                  }
                />
              </div>
            </CardFooter>
          )}
        </Card>

        {/* Location & URL - show for meetings and project events */}
        {(isProjectEvent || form.event_type === "meeting") && (
          <>
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Select
                value={form?.location}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    location: value as "In-Person" | "Online",
                  }))
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
                    setForm((prev) => ({
                      ...prev,
                      event_url: e.target.value,
                    }))
                  }
                  placeholder="https://meet.google.com/..."
                />
              </div>
            )}
          </>
        )}

        {/* Attendees - only for project events */}
        {isProjectEvent && (
          <MemberPicker
            projectId={projectId}
            value={selectedAttendees}
            onChange={setSelectedAttendees}
            label="Attendees"
          />
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
