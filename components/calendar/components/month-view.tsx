import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { MeetingWithRelations } from "@/types/meeting";
import { format, isSameMonth, isToday } from "date-fns";

interface MonthViewProps {
  currentDate: Date;
  days: Date[];
  groupedMeetings: Record<string, MeetingWithRelations[]>;
  onMeetingClick: (meeting: MeetingWithRelations) => void;
  onCreateClick: (date: Date) => void;
}

const daysName = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function MonthView({
  currentDate,
  days,
  groupedMeetings,
  onMeetingClick,
  onCreateClick,
}: Readonly<MonthViewProps>) {
  return (
    <div className="grid grid-cols-7 gap-2">
      {daysName.map((day) => (
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
              <span
                className={`text-sm font-medium ${isDayToday ? "text-primary" : ""}`}
              >
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
                <button
                  type="button"
                  key={meeting.id}
                  className="text-xs p-1 bg-primary/10 rounded truncate hover:bg-primary/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMeetingClick(meeting);
                  }}
                >
                  {format(new Date(meeting.start_time), "HH:mm")}{" "}
                  {meeting.title}
                </button>
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
  );
}
