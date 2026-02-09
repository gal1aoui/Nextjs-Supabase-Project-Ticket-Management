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
import { EventDetailContent } from "@/components/events/event-detail-content";
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
  groupEventsByDate,
} from "@/lib/utils";
import { useDrawer } from "@/contexts/drawer/drawer-context";
import { useEventsByDateRange, useUserEventsByDateRange } from "@/stores/event.store";
import type { EventWithRelations } from "@/types/event";
import DayView from "./components/day-view";
import MonthView from "./components/month-view";
import WeekView from "./components/week-view";

interface CalendarViewProps {
  projectId?: string;
  userId?: string;
  onCreateClick?: (date: Date) => void;
}

export function CalendarView({ projectId, userId, onCreateClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarsView>("month");
  const { openDrawer } = useDrawer();

  const { start, end } = getDateRange(currentDate, view);

  const projectQuery = useEventsByDateRange(projectId ?? "", start, end);
  const userQuery = useUserEventsByDateRange(userId ?? "", start, end);

  const isProjectMode = !!projectId;
  const activeQuery = isProjectMode ? projectQuery : userQuery;
  const events = activeQuery.data ?? [];
  const isLoading = activeQuery.isLoading;

  const days = getCalendarDays(currentDate, view);
  const groupedEvents = groupEventsByDate(events, days);

  const handleEventClick = (event: EventWithRelations) => {
    openDrawer({
      title: event.title,
      render: ({ close }) => <EventDetailContent event={event} onClose={close} />,
    });
  };

  const handleCreateClick = (date: Date) => {
    onCreateClick?.(date);
  };

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
    return (
      <div className="space-y-4 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="flex gap-2">
            <div className="h-9 w-9 bg-muted rounded" />
            <div className="h-9 w-9 bg-muted rounded" />
            <div className="h-9 w-32 bg-muted rounded" />
          </div>
        </div>
        <div className="h-[500px] bg-muted rounded-lg" />
      </div>
    );
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
          groupedEvents={groupedEvents}
          onEventClick={handleEventClick}
          onCreateClick={handleCreateClick}
        />
      )}

      {view === "week" && (
        <WeekView
          days={days}
          groupedEvents={groupedEvents}
          onEventClick={handleEventClick}
          onCreateClick={handleCreateClick}
        />
      )}

      {view === "day" && (
        <DayView
          currentDate={currentDate}
          events={events}
          onCreateClick={handleCreateClick}
          onEventClick={handleEventClick}
        />
      )}

    </div>
  );
}
