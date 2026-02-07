"use client";

import { format, isSameMonth, isToday } from "date-fns";
import { ChevronDown, ChevronUp, Clock } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { MeetingWithRelations } from "@/types/meeting";

interface MonthViewProps {
  currentDate: Date;
  days: Date[];
  groupedMeetings: Record<string, MeetingWithRelations[]>;
  onMeetingClick: (meeting: MeetingWithRelations) => void;
  onCreateClick: (date: Date) => void;
}

const daysName = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MAX_VISIBLE = 2;

function MeetingPill({
  meeting,
  onClick,
}: {
  meeting: MeetingWithRelations;
  onClick: (meeting: MeetingWithRelations) => void;
}) {
  return (
    <button
      type="button"
      className="group w-full flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-md bg-primary/10 hover:bg-primary/20 transition-all hover:shadow-sm animate-in fade-in slide-in-from-top-1 duration-200"
      onClick={(e) => {
        e.stopPropagation();
        onClick(meeting);
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 group-hover:scale-125 transition-transform" />
      <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
      <span className="text-muted-foreground font-medium shrink-0">
        {format(new Date(meeting.start_time), "HH:mm")}
      </span>
      <span className="truncate font-medium">{meeting.title}</span>
    </button>
  );
}

export default function MonthView({
  currentDate,
  days,
  groupedMeetings,
  onMeetingClick,
  onCreateClick,
}: Readonly<MonthViewProps>) {
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  const toggleDay = (dateKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dateKey)) {
        next.delete(dateKey);
      } else {
        next.add(dateKey);
      }
      return next;
    });
  };

  return (
    <div className="grid grid-cols-7 gap-1.5">
      {daysName.map((day) => (
        <div
          key={day}
          className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground py-2"
        >
          {day}
        </div>
      ))}

      {days.map((day) => {
        const dateKey = format(day, "yyyy-MM-dd");
        const dayMeetings = groupedMeetings[dateKey] || [];
        const isCurrentMonth = isSameMonth(day, currentDate);
        const isDayToday = isToday(day);
        const isExpanded = expandedDays.has(dateKey);
        const hasOverflow = dayMeetings.length > MAX_VISIBLE;
        const visibleMeetings = isExpanded
          ? dayMeetings
          : dayMeetings.slice(0, MAX_VISIBLE);

        return (
          <Card
            key={dateKey}
            className={`min-h-[110px] p-2 cursor-pointer transition-all duration-200 hover:bg-accent/50 hover:shadow-sm ${
              !isCurrentMonth ? "opacity-40" : ""
            } ${isDayToday ? "ring-2 ring-primary shadow-sm bg-primary/5" : ""}`}
            onClick={() => onCreateClick(day)}
          >
            <div className="flex justify-between items-center mb-1.5">
              <span
                className={`text-sm font-semibold leading-none ${
                  isDayToday
                    ? "bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center"
                    : ""
                }`}
              >
                {format(day, "d")}
              </span>
              {dayMeetings.length > 0 && (
                <Badge
                  variant="secondary"
                  className="text-[10px] h-5 px-1.5 font-semibold"
                >
                  {dayMeetings.length}
                </Badge>
              )}
            </div>

            <div className="space-y-1">
              {visibleMeetings.map((meeting) => (
                <MeetingPill
                  key={meeting.id}
                  meeting={meeting}
                  onClick={onMeetingClick}
                />
              ))}

              {hasOverflow && (
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-1 text-[11px] text-muted-foreground hover:text-foreground py-0.5 rounded hover:bg-muted/50 transition-colors"
                  onClick={(e) => toggleDay(dateKey, e)}
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-3 w-3" />
                      Show less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3" />
                      +{dayMeetings.length - MAX_VISIBLE} more
                    </>
                  )}
                </button>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
