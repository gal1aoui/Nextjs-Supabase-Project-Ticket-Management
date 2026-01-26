import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { MeetingWithRelations } from "@/types/meeting";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

interface DayViewProps {
  currentDate: Date;
  meetings: MeetingWithRelations[];
  onMeetingClick: (meeting: MeetingWithRelations) => void;
  onCreateClick: (date: Date) => void;
}

export default function DayView({
  currentDate,
  meetings,
  onCreateClick,
  onMeetingClick,
}: Readonly<DayViewProps>) {
  return (
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
                      {meeting.start_time} -{" "}
                      {meeting.end_time}
                    </div>
                    <Badge variant="secondary">
                      {meeting.attendees.length} attendees
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold mb-1">
                    {meeting.title}
                  </h3>
                  {meeting.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {meeting.description}
                    </p>
                  )}
                  {meeting.location && (
                    <p className="text-sm text-muted-foreground mt-2">
                      📍 {meeting.location}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </Card>
  );
}
