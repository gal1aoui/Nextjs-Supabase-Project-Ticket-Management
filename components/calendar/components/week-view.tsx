"use client";

import { format, isToday } from "date-fns";
import { ChevronDown, ChevronUp, Clock, MapPin, Users } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { MeetingWithRelations } from "@/types/meeting";

interface WeekViewProps {
  days: Date[];
  groupedMeetings: Record<string, MeetingWithRelations[]>;
  onMeetingClick: (meeting: MeetingWithRelations) => void;
  onCreateClick: (date: Date) => void;
}

const MAX_VISIBLE = 3;

function MeetingCard({
  meeting,
  onClick,
}: {
  meeting: MeetingWithRelations;
  onClick: (meeting: MeetingWithRelations) => void;
}) {
  return (
    <Card
      className="p-2.5 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 border-l-3 border-l-primary"
      onClick={(e) => {
        e.stopPropagation();
        onClick(meeting);
      }}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <Clock className="h-3 w-3 text-primary" />
        <span className="text-xs font-semibold text-primary">
          {format(new Date(meeting.start_time), "HH:mm")}
        </span>
      </div>
      <div className="text-sm font-medium truncate mb-1">{meeting.title}</div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="h-3 w-3" />
          {meeting.attendees.length}
        </div>
        {meeting.location && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="truncate max-w-[60px]">{meeting.location}</span>
          </div>
        )}
      </div>
    </Card>
  );
}

export default function WeekView({
  days,
  groupedMeetings,
  onMeetingClick,
  onCreateClick,
}: Readonly<WeekViewProps>) {
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
    <div className="grid grid-cols-7 gap-2">
      {days.map((day) => {
        const dateKey = format(day, "yyyy-MM-dd");
        const dayMeetings = groupedMeetings[dateKey] || [];
        const isDayToday = isToday(day);
        const isExpanded = expandedDays.has(dateKey);
        const hasOverflow = dayMeetings.length > MAX_VISIBLE;
        const visibleMeetings = isExpanded
          ? dayMeetings
          : dayMeetings.slice(0, MAX_VISIBLE);

        return (
          <Card
            key={dateKey}
            className={`min-h-[400px] p-3 cursor-pointer transition-all duration-200 hover:bg-accent/50 ${
              isDayToday ? "ring-2 ring-primary shadow-md bg-primary/5" : ""
            }`}
            onClick={() => onCreateClick(day)}
          >
            <div className="text-center mb-3 pb-2 border-b">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {format(day, "EEE")}
              </div>
              <div
                className={`text-2xl font-bold mt-0.5 ${
                  isDayToday
                    ? "bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center mx-auto"
                    : ""
                }`}
              >
                {format(day, "d")}
              </div>
              {dayMeetings.length > 0 && (
                <Badge
                  variant="secondary"
                  className="mt-1.5 text-[10px] h-5 px-1.5"
                >
                  {dayMeetings.length} meeting{dayMeetings.length > 1 ? "s" : ""}
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              {visibleMeetings.map((meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  onClick={onMeetingClick}
                />
              ))}

              {hasOverflow && (
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground py-1.5 rounded-md hover:bg-muted/50 transition-colors"
                  onClick={(e) => toggleDay(dateKey, e)}
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-3.5 w-3.5" />
                      Show less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3.5 w-3.5" />
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
