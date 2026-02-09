"use client";

import { format, isSameMonth, isToday } from "date-fns";
import { ChevronDown, ChevronUp, Clock } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { isMultiDayEvent } from "@/lib/utils";
import { EVENT_TYPE_LABELS, type EventWithRelations } from "@/types/event";

interface MonthViewProps {
  currentDate: Date;
  days: Date[];
  groupedEvents: Record<string, EventWithRelations[]>;
  onEventClick: (event: EventWithRelations) => void;
  onCreateClick?: (date: Date) => void;
}

const daysName = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MAX_VISIBLE = 2;

const multiDayStyle = {
  background:
    "repeating-linear-gradient(135deg, transparent, transparent 3px, rgba(236, 72, 153, 0.12) 3px, rgba(236, 72, 153, 0.12) 6px)",
};

function EventPill({
  event,
  onClick,
}: {
  event: EventWithRelations;
  onClick: (event: EventWithRelations) => void;
}) {
  const multiDay = isMultiDayEvent(event);

  return (
    <button
      type="button"
      className={`group w-full flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-md transition-all hover:shadow-sm animate-in fade-in slide-in-from-top-1 duration-200 ${
        multiDay
          ? "border border-pink-300/50 hover:border-pink-400/70"
          : "bg-primary/10 hover:bg-primary/20"
      }`}
      style={multiDay ? multiDayStyle : undefined}
      onClick={(e) => {
        e.stopPropagation();
        onClick(event);
      }}
    >
      {multiDay ? (
        <>
          <span className="w-1.5 h-1.5 rounded-full bg-pink-500 shrink-0 group-hover:scale-125 transition-transform" />
          <span className="truncate font-medium text-pink-700 dark:text-pink-300">
            {EVENT_TYPE_LABELS[event.event_type]}
          </span>
        </>
      ) : (
        <>
          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 group-hover:scale-125 transition-transform" />
          <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground font-medium shrink-0">
            {event.start_time.slice(0, 5)}
          </span>
          <span className="truncate font-medium">{event.title}</span>
        </>
      )}
    </button>
  );
}

export default function MonthView({
  currentDate,
  days,
  groupedEvents,
  onEventClick,
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
        const dayEvents = groupedEvents[dateKey] || [];
        const isCurrentMonth = isSameMonth(day, currentDate);
        const isDayToday = isToday(day);
        const isExpanded = expandedDays.has(dateKey);
        const hasOverflow = dayEvents.length > MAX_VISIBLE;
        const visibleEvents = isExpanded
          ? dayEvents
          : dayEvents.slice(0, MAX_VISIBLE);

        return (
          <Card
            key={dateKey}
            className={`min-h-[110px] p-2 cursor-pointer transition-all duration-200 hover:bg-accent/50 hover:shadow-sm ${
              !isCurrentMonth ? "opacity-40" : ""
            } ${isDayToday ? "ring-2 ring-primary shadow-sm bg-primary/5" : ""}`}
            onClick={() => onCreateClick?.(day)}
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
              {dayEvents.length > 0 && (
                <Badge
                  variant="secondary"
                  className="text-[10px] h-5 px-1.5 font-semibold"
                >
                  {dayEvents.length}
                </Badge>
              )}
            </div>

            <div className="space-y-1">
              {visibleEvents.map((event) => (
                <EventPill
                  key={event.id}
                  event={event}
                  onClick={onEventClick}
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
                      +{dayEvents.length - MAX_VISIBLE} more
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
