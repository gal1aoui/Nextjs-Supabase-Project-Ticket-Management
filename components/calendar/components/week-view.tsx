"use client";

import { format, isToday } from "date-fns";
import { ChevronDown, ChevronUp, Clock, MapPin, Users } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { isMultiDayEvent } from "@/lib/utils";
import { EVENT_TYPE_LABELS, type EventWithRelations } from "@/types/event";

interface WeekViewProps {
  days: Date[];
  groupedEvents: Record<string, EventWithRelations[]>;
  onEventClick: (event: EventWithRelations) => void;
  onCreateClick?: (date: Date) => void;
}

const MAX_VISIBLE = 3;

const multiDayStyle = {
  background:
    "repeating-linear-gradient(135deg, transparent, transparent 3px, rgba(236, 72, 153, 0.12) 3px, rgba(236, 72, 153, 0.12) 6px)",
};

function EventCard({
  event,
  onClick,
}: {
  event: EventWithRelations;
  onClick: (event: EventWithRelations) => void;
}) {
  const multiDay = isMultiDayEvent(event);
  const projectColor = event.project?.color;

  return (
    <Card
      className={`p-2.5 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 border-l-3 ${
        multiDay ? "border-l-pink-500" : projectColor ? "" : "border-l-primary"
      }`}
      style={
        multiDay
          ? multiDayStyle
          : projectColor
            ? { borderLeftColor: projectColor }
            : undefined
      }
      onClick={(e) => {
        e.stopPropagation();
        onClick(event);
      }}
    >
      <div className="flex items-center gap-1.5 mb-1">
        {multiDay ? (
          <Badge
            variant="outline"
            className="text-[10px] h-4 px-1 border-pink-300 text-pink-600 dark:text-pink-300"
          >
            {EVENT_TYPE_LABELS[event.event_type]}
          </Badge>
        ) : (
          <>
            <Clock className="h-3 w-3" style={projectColor ? { color: projectColor } : undefined} />
            <span className="text-xs font-semibold" style={projectColor ? { color: projectColor } : undefined}>
              {event.start_time.slice(0, 5)}
            </span>
          </>
        )}
      </div>
      <div className="text-sm font-medium truncate mb-1">{event.title}</div>
      {!multiDay && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            {event.attendees.length}
          </div>
          {event.location && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="truncate max-w-[60px]">{event.location}</span>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export default function WeekView({
  days,
  groupedEvents,
  onEventClick,
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
        const dayEvents = groupedEvents[dateKey] || [];
        const isDayToday = isToday(day);
        const isExpanded = expandedDays.has(dateKey);
        const hasOverflow = dayEvents.length > MAX_VISIBLE;
        const visibleEvents = isExpanded ? dayEvents : dayEvents.slice(0, MAX_VISIBLE);

        return (
          <Card
            key={dateKey}
            className={`min-h-[400px] p-3 cursor-pointer transition-all duration-200 hover:bg-accent/50 ${
              isDayToday ? "ring-2 ring-primary shadow-md bg-primary/5" : ""
            }`}
            onClick={() => onCreateClick?.(day)}
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
              {dayEvents.length > 0 && (
                <Badge variant="secondary" className="mt-1.5 text-[10px] h-5 px-1.5">
                  {dayEvents.length} event{dayEvents.length > 1 ? "s" : ""}
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              {visibleEvents.map((event) => (
                <EventCard key={event.id} event={event} onClick={onEventClick} />
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
                      <ChevronDown className="h-3.5 w-3.5" />+{dayEvents.length - MAX_VISIBLE} more
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
