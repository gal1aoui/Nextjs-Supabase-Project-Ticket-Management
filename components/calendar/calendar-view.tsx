"use client";

import {
  addDays,
  addMonths,
  addWeeks,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type CalendarView as CalendarsView,
  formatDateForView,
  getCalendarDays,
  getDateRange,
  groupMeetingsByDate
} from "@/lib/utils";
import { useMeetingsByDateRange } from "@/stores/meeting.store";
import type { MeetingWithRelations } from "@/types/meeting";
import MonthView from "./components/month-view";
import WeekView from "./components/week-view";
import DayView from "./components/day-view";

interface CalendarViewProps {
  projectId: string;
  onMeetingClick: (meeting: MeetingWithRelations) => void;
  onCreateClick: (date: Date) => void;
}

export function CalendarView({ projectId, onMeetingClick, onCreateClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarsView>("month");

  const { start, end } = getDateRange(currentDate, view);
  const { data: meetings = [], isLoading } = useMeetingsByDateRange(projectId, start, end);

  const days = getCalendarDays(currentDate, view);
  const groupedMeetings = groupMeetingsByDate(meetings, days);

  const navigatePrev = () => {
    switch (view) {
      case "day":
        setCurrentDate(subDays(currentDate, 1));
        break;
      case "week":
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case "month":
        setCurrentDate(subMonths(currentDate, 1));
        break;
    }
  };

  const navigateNext = () => {
    switch (view) {
      case "day":
        setCurrentDate(addDays(currentDate, 1));
        break;
      case "week":
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case "month":
        setCurrentDate(addMonths(currentDate, 1));
        break;
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  if (isLoading) {
    return <div>Loading calendar...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">
            {formatDateForView(currentDate, view)}
          </h2>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={navigatePrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={navigateNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Select
            value={view}
            onValueChange={(v) => setView(v as CalendarsView)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {view === "month" && (
        <MonthView
          currentDate={currentDate}
          days={days}
          groupedMeetings={groupedMeetings}
          onMeetingClick={onMeetingClick}
          onCreateClick={onCreateClick}
        />
      )}

      {view === "week" && (
        <WeekView
          days={days}
          groupedMeetings={groupedMeetings}
          onMeetingClick={onMeetingClick}
          onCreateClick={onCreateClick}
        />
      )}

      {view === "day" && (
        <DayView
          currentDate={currentDate}
          meetings={meetings}
          onCreateClick={onCreateClick}
          onMeetingClick={onMeetingClick}
        />
      )}
    </div>
  );
}
