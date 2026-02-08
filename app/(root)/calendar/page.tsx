"use client";

import { format } from "date-fns";
import { Calendar, Clock, Plus, Video } from "lucide-react";
import { useMemo, useState } from "react";
import { CalendarView } from "@/components/calendar/calendar-view";
import EventForm from "@/components/events/forms/event-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useModal } from "@/contexts/modal/modal-context";
import { useUser } from "@/hooks/use-user";
import { getCalendarDays, getDateRange, groupEventsByDate } from "@/lib/utils";
import { useUserEventsByDateRange } from "@/stores/event.store";
import type { EventWithRelations } from "@/types/event";
import { EVENT_TYPE_LABELS } from "@/types/event";

export default function CalendarPage() {
  const { data: user, isLoading: userLoading } = useUser();

  if (userLoading) {
    return (
      <div className="flex-1 p-8 pt-6 space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-muted rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-24 bg-muted rounded-lg" />
          <div className="h-24 bg-muted rounded-lg" />
          <div className="h-24 bg-muted rounded-lg" />
        </div>
        <div className="h-[500px] bg-muted rounded-lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 p-8 pt-6">
        <p>Please log in to view your calendar.</p>
      </div>
    );
  }

  return <CalendarPageContent userId={user.id} />;
}

function CalendarPageContent({ userId }: { userId: string }) {
  const [currentDate] = useState(new Date());
  const { start, end } = getDateRange(currentDate, "month");
  const { data: events = [] } = useUserEventsByDateRange(userId, start, end);
  const { openModal } = useModal();

  const todayEvents = useMemo(() => {
    const today = new Date();
    const todayStr = format(today, "yyyy-MM-dd");
    const days = getCalendarDays(today, "day");
    const grouped = groupEventsByDate(events, days);
    return grouped[todayStr] ?? [];
  }, [events]);

  const upcomingCount = useMemo(() => {
    const now = new Date();
    return events.filter((m) => new Date(m.start_time) > now).length;
  }, [events]);

  const projectSet = useMemo(() => {
    const set = new Set<string>();
    for (const e of events) {
      if (e.project) set.add(e.project.name);
    }
    return set;
  }, [events]);

  const handleCreatePersonalEvent = (date?: Date) => {
    openModal({
      title: "Create Personal Event",
      description: "Add a personal event to your calendar",
      render: ({ close }) => (
        <EventForm
          defaultEventDate={date}
          closeModal={close}
        />
      ),
    });
  };

  return (
    <div className="flex-1 p-8 pt-6 space-y-6">
      {/* Page Header */}
      <div className="animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Calendar</h1>
              <p className="text-muted-foreground text-sm">
                All your events across every project
              </p>
            </div>
          </div>
          <Button onClick={() => handleCreatePersonalEvent()}>
            <Plus className="mr-2 h-4 w-4" />
            Personal Event
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: "100ms", animationFillMode: "both" }}>
        <Card className="p-4 border-l-4 border-l-primary hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Today
              </p>
              <p className="text-2xl font-bold mt-1">{todayEvents.length}</p>
              <p className="text-xs text-muted-foreground">
                {todayEvents.length === 1 ? "event" : "events"} scheduled
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Upcoming
              </p>
              <p className="text-2xl font-bold mt-1">{upcomingCount}</p>
              <p className="text-xs text-muted-foreground">this month</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-blue-500" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Projects
              </p>
              <p className="text-2xl font-bold mt-1">{projectSet.size}</p>
              <p className="text-xs text-muted-foreground">with events</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Video className="h-5 w-5 text-emerald-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Today's Quick View */}
      {todayEvents.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: "200ms", animationFillMode: "both" }}>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Today&apos;s Schedule
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {todayEvents.map((event) => (
              <TodayEventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}

      {/* Full Calendar */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: "300ms", animationFillMode: "both" }}>
        <CalendarView
          userId={userId}
          onCreateClick={(date) => handleCreatePersonalEvent(date)}
        />
      </div>
    </div>
  );
}

function TodayEventCard({ event }: { event: EventWithRelations }) {
  return (
    <Card className="min-w-60 p-3 border-l-3 border-l-primary hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 shrink-0">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Clock className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-semibold text-primary">
          {format(new Date(event.start_time), "HH:mm")} -{" "}
          {format(new Date(event.end_time), "HH:mm")}
        </span>
      </div>
      <p className="font-medium text-sm truncate">{event.title}</p>
      <div className="flex items-center gap-2 mt-1.5">
        {event.project ? (
          <Badge variant="outline" className="text-[10px] h-5 px-1.5">
            {event.project.name}
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
            {EVENT_TYPE_LABELS[event.event_type] ?? "Personal"}
          </Badge>
        )}
        <span className="text-[10px] text-muted-foreground">
          {event.attendees.length} attendee{event.attendees.length !== 1 ? "s" : ""}
        </span>
      </div>
    </Card>
  );
}
