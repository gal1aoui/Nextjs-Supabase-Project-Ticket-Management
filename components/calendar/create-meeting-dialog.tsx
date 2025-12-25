import { useState } from "react";
import type { MeetingCreate } from "@/types/meeting";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";

interface CreateMeetingDialogProps {
  startingDate?: Date;
  startingHour?: string | null;
  open: boolean;
  closeModal: () => void;
}

export default function CreateMeetingDialog({
  startingDate,
  startingHour,
  open,
  closeModal,
}: Readonly<CreateMeetingDialogProps>) {
  const [formData, setFormData] = useState<MeetingCreate>({
    title: "",
    description: "",
    start_date: startingDate || new Date(),
    end_date: startingDate || new Date(),
    start_time: startingHour || undefined,
    end_time: undefined,
    attendees: [] as string[],
    location: "Online" as const,
    color: "#000000",
  });

  const formatTime = (timeStr: string | undefined) => {
    if (!timeStr) return "00:00:00";
    const [time, meridian] = timeStr.split(" "); // e.g., ["3:12", "PM"]
    const [hours, minutes] = time.split(":"); // e.g., ["3", "12"]
    let hoursInt = parseInt(hours, 10);

    if (meridian === "PM" && hoursInt !== 12) {
      // For PM times (except 12 PM), add 12 to the hour
      hoursInt += 12;
    } else if (meridian === "AM" && hoursInt === 12) {
      // For 12 AM (midnight), set the hour to 00
      hoursInt = 0;
    }
    // For AM times (except 12 AM) and 12 PM (noon), hours remain the same

    // Format hours and minutes to ensure two digits
    const hours24h = hoursInt.toString().padStart(2, "0");
    const minutesFormatted = minutes.padStart(2, "0");

    return `${hours24h}:${minutesFormatted}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };
  return (
    <Dialog open={open} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Ticket</DialogTitle>
            <DialogDescription>Add a new ticket to your project board</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter ticket title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter ticket description"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="state">State *</Label>
              <Calendar
                mode="range"
                defaultMonth={formData.start_date}
                selected={{ from: formData.start_date, to: formData.end_date }}
                onSelect={(range) => {
                  if (range?.from) {
                    setFormData({
                      ...formData,
                      start_date: range.from,
                      end_date: range.to || range.from,
                    });
                  }
                }}
                numberOfMonths={2}
                className="rounded-lg border shadow-sm"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex flex-col gap-3">
                <Label htmlFor="time-from" className="px-1">
                  From
                </Label>
                <Input
                  type="time"
                  id="start_time"
                  value={formatTime(formData.start_time)}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  step="1"
                  className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="time-to" className="px-1">
                  To
                </Label>
                <Input
                  type="time"
                  id="end_time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  step="1"
                  className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-state">State *</Label>
              <Select
                value={formData.location}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    location: value as "In-Person" | "Online",
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
            <div className="grid gap-2">
              <Label htmlFor="color">Meeting Color</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-20 h-10"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="#3B82F6"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => closeModal()}>
              Cancel
            </Button>
            <Button type="submit">Create Meeting</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
