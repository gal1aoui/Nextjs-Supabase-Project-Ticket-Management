"use client";

import {
  CalendarIcon,
  CalendarRange,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  Users,
  Video,
} from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getUserInitials } from "@/lib/helpers";
import { isMultiDayEvent } from "@/lib/utils";
import { EVENT_TYPE_LABELS, type EventWithRelations } from "@/types/event";

interface DayViewProps {
  currentDate: Date;
  events: EventWithRelations[];
  onEventClick: (event: EventWithRelations) => void;
  onCreateClick?: (date: Date) => void;
}

const MAX_VISIBLE = 5;

const multiDayStyle = {
  background:
    "repeating-linear-gradient(135deg, transparent, transparent 4px, rgba(236, 72, 153, 0.1) 4px, rgba(236, 72, 153, 0.1) 8px)",
};

function EventCard({
  event,
  onClick,
  index,
}: {
  event: EventWithRelations;
  onClick: (event: EventWithRelations) => void;
  index: number;
}) {
  const multiDay = isMultiDayEvent(event);
  const projectColor = event.project?.color;

  return (
    <Card
      className={`p-4 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 animate-in fade-in slide-in-from-left-3 border-l-4 ${
        multiDay ? "border-l-pink-500" : projectColor ? "" : "border-l-primary"
      }`}
      style={{
        animationDelay: `${index * 50}ms`,
        animationFillMode: "both",
        ...(multiDay ? multiDayStyle : {}),
        ...(!multiDay && projectColor ? { borderLeftColor: projectColor } : {}),
      }}
      onClick={() => onClick(event)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            {multiDay ? (
              <div className="flex items-center gap-1.5 text-sm font-semibold text-pink-600 dark:text-pink-300">
                <CalendarRange className="h-4 w-4" />
                <Badge
                  variant="outline"
                  className="border-pink-300 text-pink-600 dark:text-pink-300 text-xs"
                >
                  {EVENT_TYPE_LABELS[event.event_type]}
                </Badge>
              </div>
            ) : (
              <div
                className="flex items-center gap-1.5 text-sm font-semibold"
                style={projectColor ? { color: projectColor } : undefined}
              >
                <Clock className="h-4 w-4" />
                {event.start_time.slice(0, 5)} - {event.end_time.slice(0, 5)}
              </div>
            )}
            {event.attendees.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                {event.attendees.length}
              </Badge>
            )}
          </div>

          <h3 className="text-lg font-semibold mb-1 truncate">{event.title}</h3>

          {event.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{event.description}</p>
          )}

          <div className="flex items-center gap-4">
            {event.location && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {event.location}
              </div>
            )}
            {event.event_url && (
              <div className="flex items-center gap-1.5 text-xs text-primary">
                <Video className="h-3.5 w-3.5" />
                Video call
              </div>
            )}
          </div>
        </div>

        {/* Attendee avatars */}
        {event.attendees.length > 0 && (
          <div className="flex -space-x-2 ml-4 shrink-0">
            {event.attendees.slice(0, 3).map((attendee) => (
              <Avatar key={attendee.id} className="h-7 w-7 border-2 border-background">
                <AvatarImage src={attendee.profile.avatar_url || undefined} />
                <AvatarFallback className="text-[10px]">
                  {getUserInitials(attendee.profile.full_name)}
                </AvatarFallback>
              </Avatar>
            ))}
            {event.attendees.length > 3 && (
              <div className="h-7 w-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-medium">
                +{event.attendees.length - 3}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

export default function DayView({
  currentDate,
  events,
  onCreateClick,
  onEventClick,
}: Readonly<DayViewProps>) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasOverflow = events.length > MAX_VISIBLE;
  const visibleEvents = isExpanded ? events : events.slice(0, MAX_VISIBLE);

  return (
    <Card className="p-6">
      <div className="space-y-3">
        {events.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground animate-in fade-in duration-500">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
              <CalendarIcon className="h-8 w-8 opacity-40" />
            </div>
            <p className="text-lg font-medium mb-1">No events scheduled</p>
            <p className="text-sm mb-4">
              {onCreateClick
                ? "This day is free. Schedule an event to get started."
                : "No events on this day."}
            </p>
            {onCreateClick && (
              <Button onClick={() => onCreateClick(currentDate)}>Schedule Event</Button>
            )}
          </div>
        ) : (
          <>
            {visibleEvents.map((event, index) => (
              <EventCard key={event.id} event={event} onClick={onEventClick} index={index} />
            ))}

            {hasOverflow && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground hover:text-foreground"
                onClick={() => setIsExpanded((prev) => !prev)}
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1.5" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1.5" />
                    Show {events.length - MAX_VISIBLE} more events
                  </>
                )}
              </Button>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
