/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <explanation> */
"use client";

import {
  addDays,
  addMonths,
  addWeeks,
  format,
  isSameMonth,
  isToday,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  groupMeetingsByDate,
  type MeetingWithRelations,
} from "@/lib/utils";
import { useMeetingsByDateRange } from "@/stores/meeting.store";

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
          <h2 className="text-2xl font-bold">{formatDateForView(currentDate, view)}</h2>
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

          <Select value={view} onValueChange={(v) => setView(v as CalendarsView)}>
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

      {/* Calendar Grid */}
      {view === "month" && (
        <div className="grid grid-cols-7 gap-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div key={day} className="text-center text-sm font-medium p-2">
              {day}
            </div>
          ))}

          {days.map((day) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const dayMeetings = groupedMeetings[dateKey] || [];
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isDayToday = isToday(day);

            return (
              <Card
                key={dateKey}
                className={`min-h-[120px] p-2 cursor-pointer hover:bg-accent transition-colors ${
                  !isCurrentMonth ? "opacity-40" : ""
                } ${isDayToday ? "ring-2 ring-primary" : ""}`}
                onClick={() => onCreateClick(day)}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-sm font-medium ${isDayToday ? "text-primary" : ""}`}>
                    {format(day, "d")}
                  </span>
                  {dayMeetings.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {dayMeetings.length}
                    </Badge>
                  )}
                </div>
                <div className="space-y-1">
                  {dayMeetings.slice(0, 3).map((meeting) => (
                    <div
                      key={meeting.id}
                      className="text-xs p-1 bg-primary/10 rounded truncate hover:bg-primary/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMeetingClick(meeting);
                      }}
                    >
                      {format(new Date(meeting.start_time), "HH:mm")} {meeting.title}
                    </div>
                  ))}
                  {dayMeetings.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayMeetings.length - 3} more
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Week View */}
      {view === "week" && (
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const dayMeetings = groupedMeetings[dateKey] || [];
            const isDayToday = isToday(day);

            return (
              <Card
                key={dateKey}
                className={`min-h-[400px] p-3 cursor-pointer hover:bg-accent transition-colors ${
                  isDayToday ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => onCreateClick(day)}
              >
                <div className="text-center mb-3">
                  <div className="text-sm font-medium">{format(day, "EEE")}</div>
                  <div className={`text-2xl font-bold ${isDayToday ? "text-primary" : ""}`}>
                    {format(day, "d")}
                  </div>
                </div>
                <div className="space-y-2">
                  {dayMeetings.map((meeting) => (
                    <Card
                      key={meeting.id}
                      className="p-2 cursor-pointer hover:shadow-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMeetingClick(meeting);
                      }}
                    >
                      <div className="text-xs font-medium text-primary">
                        {format(new Date(meeting.start_time), "HH:mm")}
                      </div>
                      <div className="text-sm font-medium truncate">{meeting.title}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {meeting.attendees.length} attendees
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Day View */}
      {view === "day" && (
        <Card className="p-6">
          <div className="space-y-3">
            {meetings.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No meetings scheduled for this day</p>
                <Button className="mt-4" onClick={() => onCreateClick(currentDate)}>
                  Schedule Meeting
                </Button>
              </div>
            ) : (
              meetings.map((meeting) => (
                <Card
                  key={meeting.id}
                  className="p-4 cursor-pointer hover:shadow-md"
                  onClick={() => onMeetingClick(meeting)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-sm font-medium text-primary">
                          {format(new Date(meeting.start_time), "HH:mm")} -{" "}
                          {format(new Date(meeting.end_time), "HH:mm")}
                        </div>
                        <Badge variant="secondary">{meeting.attendees.length} attendees</Badge>
                      </div>
                      <h3 className="text-lg font-semibold mb-1">{meeting.title}</h3>
                      {meeting.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {meeting.description}
                        </p>
                      )}
                      {meeting.location && (
                        <p className="text-sm text-muted-foreground mt-2">📍 {meeting.location}</p>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
