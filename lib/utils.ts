import { type ClassValue, clsx } from "clsx";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { twMerge } from "tailwind-merge";

// ===========================================
// CSS Utilities
// ===========================================

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ===========================================
// Calendar Utilities
// ===========================================

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

export function groupMeetingsByDate<T extends { start_time: string }>(
  meetings: T[],
  days: Date[]
): Record<string, T[]> {
  const grouped: Record<string, T[]> = {};

  days.forEach((day) => {
    const key = format(day, "yyyy-MM-dd");
    grouped[key] = meetings.filter((meeting) => isSameDay(new Date(meeting.start_time), day));
  });

  return grouped;
}
