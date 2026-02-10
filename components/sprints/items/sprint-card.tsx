"use client";

import { Calendar, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Sprint } from "@/types/sprint";
import type { Ticket } from "@/types/ticket";

interface SprintCardProps {
  sprint: Sprint;
  tickets: Ticket[];
  completedStateIds: string[];
  onClick?: () => void;
}

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  planning: "outline",
  active: "default",
  completed: "secondary",
};

export function SprintCard({ sprint, tickets, completedStateIds, onClick }: SprintCardProps) {
  const totalTickets = tickets.length;
  const doneTickets = tickets.filter((t) => completedStateIds.includes(t.state_id)).length;
  const progress = totalTickets > 0 ? Math.round((doneTickets / totalTickets) * 100) : 0;

  const startDate = new Date(sprint.start_date);
  const endDate = new Date(sprint.end_date);
  const now = new Date();
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(
    0,
    Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  );

  return (
    <Card
      onClick={onClick}
      className={onClick ? "cursor-pointer hover:bg-accent/50 transition-colors" : ""}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{sprint.name}</CardTitle>
          <Badge variant={statusVariant[sprint.status]}>{sprint.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {sprint.goal && (
          <div className="flex items-start gap-2">
            <Target className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground line-clamp-2">{sprint.goal}</p>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>
            {startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} —{" "}
            {endDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">
              {doneTickets} / {totalTickets} tickets
            </span>
            {sprint.status === "active" && (
              <span className="text-muted-foreground">
                {daysRemaining}d / {totalDays}d remaining
              </span>
            )}
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      </CardContent>
    </Card>
  );
}
