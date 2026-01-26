import { Card } from "@/components/ui/card";
import type { MeetingWithRelations } from "@/types/meeting";
import { format, isToday } from "date-fns";

interface WeekViewProps {
  days: Date[];
  groupedMeetings: Record<string, MeetingWithRelations[]>;
  onMeetingClick: (meeting: MeetingWithRelations) => void;
  onCreateClick: (date: Date) => void;
}

export default function WeekView({
  days,
  groupedMeetings,
  onMeetingClick,
  onCreateClick,
}: Readonly<WeekViewProps>) {
  return (
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
              <div
                className={`text-2xl font-bold ${isDayToday ? "text-primary" : ""}`}
              >
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
                  <div className="text-sm font-medium truncate">
                    {meeting.title}
                  </div>
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
  );
}
