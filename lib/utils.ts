import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Profile, Project } from "@/types/database";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Meeting = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  meeting_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type MeetingAttendee = {
  id: string;
  meeting_id: string;
  user_id: string;
  status: "invited" | "accepted" | "declined" | "tentative";
  created_at: string;
};

export type MeetingWithRelations = Meeting & {
  attendees: (MeetingAttendee & { profile: Profile })[];
  creator: Profile | null;
  project: Project;
};

import { z } from "zod";

export const meetingCreateSchema = z
  .object({
    project_id: z.uuid("Invalid project ID"),
    title: z.string().min(1, "Title is required").max(200),
    description: z.string().optional(),
    start_time: z.iso.datetime(),
    end_time: z.iso.datetime(),
    location: z.string().optional(),
    meeting_url: z.string().url().optional(),
    attendee_ids: z.array(z.string().uuid()).optional(),
  })
  .refine((data) => new Date(data.end_time) > new Date(data.start_time), {
    message: "End time must be after start time",
    path: ["end_time"],
  });

export const meetingUpdateSchema = z.object({
  id: z.uuid(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  start_time: z.iso.datetime().optional(),
  end_time: z.iso.datetime().optional(),
  location: z.string().optional(),
  meeting_url: z.url().optional(),
});

export const attendeeUpdateSchema = z.object({
  meeting_id: z.uuid(),
  user_id: z.uuid(),
  status: z.enum(["invited", "accepted", "declined", "tentative"]),
});

export type MeetingCreate = z.infer<typeof meetingCreateSchema>;
export type MeetingUpdate = z.infer<typeof meetingUpdateSchema>;
export type AttendeeUpdate = z.infer<typeof attendeeUpdateSchema>;

import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subDays,
} from "date-fns";

export type CalendarView = "day" | "week" | "month";

export function getCalendarDays(date: Date, view: CalendarView) {
  switch (view) {
    case "day":
      return [date];
    case "week":
      return eachDayOfInterval({
        start: startOfWeek(date, { weekStartsOn: 1 }),
        end: endOfWeek(date, { weekStartsOn: 1 }),
      });
    case "month": {
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
      const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
      return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    }
  }
}

export function getDateRange(date: Date, view: CalendarView): { start: Date; end: Date } {
  switch (view) {
    case "day":
      return {
        start: new Date(date.setHours(0, 0, 0, 0)),
        end: new Date(date.setHours(23, 59, 59, 999)),
      };
    case "week":
      return {
        start: startOfWeek(date, { weekStartsOn: 1 }),
        end: endOfWeek(date, { weekStartsOn: 1 }),
      };
    case "month":
      return {
        start: startOfMonth(date),
        end: endOfMonth(date),
      };
  }
}

export function formatDateForView(date: Date, view: CalendarView): string {
  switch (view) {
    case "day":
      return format(date, "EEEE, MMMM d, yyyy");
    case "week": {
      const weekStart = startOfWeek(date, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
      return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;
    }
    case "month":
      return format(date, "MMMM yyyy");
  }
}

export function groupMeetingsByDate(meetings: any[], days: Date[]) {
  const grouped: Record<string, any[]> = {};

  days.forEach((day) => {
    const key = format(day, "yyyy-MM-dd");
    grouped[key] = meetings.filter((meeting) => isSameDay(new Date(meeting.start_time), day));
  });

  return grouped;
}
