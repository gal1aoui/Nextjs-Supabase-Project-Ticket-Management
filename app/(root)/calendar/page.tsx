"use client";

import { format } from "date-fns";
import { Calendar, Clock, Video } from "lucide-react";
import { useMemo, useState } from "react";
import { CalendarView } from "@/components/calendar/calendar-view";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useUser } from "@/hooks/use-user";
import { getCalendarDays, getDateRange, groupMeetingsByDate } from "@/lib/utils";
import { useUserMeetingsByDateRange } from "@/stores/meeting.store";
import type { MeetingWithRelations } from "@/types/meeting";

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
  const { data: meetings = [] } = useUserMeetingsByDateRange(userId, start, end);

  const todayMeetings = useMemo(() => {
    const today = new Date();
    const todayStr = format(today, "yyyy-MM-dd");
    const days = getCalendarDays(today, "day");
    const grouped = groupMeetingsByDate(meetings, days);
    return grouped[todayStr] ?? [];
  }, [meetings]);

  const upcomingCount = useMemo(() => {
    const now = new Date();
    return meetings.filter((m) => new Date(m.start_time) > now).length;
  }, [meetings]);

  const projectSet = useMemo(() => {
    const set = new Set<string>();
    for (const m of meetings) {
      if (m.project) set.add(m.project.name);
    }
    return set;
  }, [meetings]);

  return (
    <div className="flex-1 p-8 pt-6 space-y-6">
      {/* Page Header */}
      <div className="animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Calendar</h1>
            <p className="text-muted-foreground text-sm">
              All your meetings across every project
            </p>
          </div>
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
              <p className="text-2xl font-bold mt-1">{todayMeetings.length}</p>
              <p className="text-xs text-muted-foreground">
                {todayMeetings.length === 1 ? "meeting" : "meetings"} scheduled
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
              <p className="text-xs text-muted-foreground">with meetings</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Video className="h-5 w-5 text-emerald-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Today's Quick View */}
      {todayMeetings.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: "200ms", animationFillMode: "both" }}>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Today&apos;s Schedule
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {todayMeetings.map((meeting) => (
              <TodayMeetingCard key={meeting.id} meeting={meeting} />
            ))}
          </div>
        </div>
      )}

      {/* Full Calendar */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: "300ms", animationFillMode: "both" }}>
        <CalendarView userId={userId} />
      </div>
    </div>
  );
}

function TodayMeetingCard({ meeting }: { meeting: MeetingWithRelations }) {
  return (
    <Card className="min-w-60 p-3 border-l-3 border-l-primary hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 shrink-0">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Clock className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-semibold text-primary">
          {format(new Date(meeting.start_time), "HH:mm")} -{" "}
          {format(new Date(meeting.end_time), "HH:mm")}
        </span>
      </div>
      <p className="font-medium text-sm truncate">{meeting.title}</p>
      <div className="flex items-center gap-2 mt-1.5">
        <Badge variant="outline" className="text-[10px] h-5 px-1.5">
          {meeting.project?.name}
        </Badge>
        <span className="text-[10px] text-muted-foreground">
          {meeting.attendees.length} attendee{meeting.attendees.length !== 1 ? "s" : ""}
        </span>
      </div>
    </Card>
  );
}
