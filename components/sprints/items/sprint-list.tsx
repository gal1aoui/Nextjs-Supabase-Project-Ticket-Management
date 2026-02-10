"use client";

import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTickets } from "@/stores/ticket.store";
import { useTicketStates } from "@/stores/ticket-state.store";
import type { Sprint } from "@/types/sprint";
import type { Ticket } from "@/types/ticket";
import { SprintCard } from "./sprint-card";

interface SprintListProps {
  sprints: Sprint[];
  projectId: string;
  isLoading: boolean;
  onSprintClick: (sprint: Sprint) => void;
}

export function SprintList({ sprints, projectId, isLoading, onSprintClick }: SprintListProps) {
  const { data: allTickets = [] } = useTickets(projectId);
  const { data: states = [] } = useTicketStates(projectId);

  const completedStateIds = useMemo(() => {
    if (states.length === 0) return [];
    const sorted = [...states].sort((a, b) => a.order - b.order);
    const lastState = sorted[sorted.length - 1];
    return lastState ? [lastState.id] : [];
  }, [states]);

  const ticketsBySprint = useMemo(() => {
    const grouped: Record<string, Ticket[]> = {};
    for (const sprint of sprints) {
      grouped[sprint.id] = allTickets.filter((t) => t.sprint_id === sprint.id);
    }
    return grouped;
  }, [allTickets, sprints]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    );
  }

  if (sprints.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-sm">No sprints yet</p>
        <p className="text-xs mt-1">Create a sprint to start planning your work</p>
      </div>
    );
  }

  // Sort: active first, then planning, then completed
  const sortedSprints = [...sprints].sort((a, b) => {
    const order = { active: 0, planning: 1, completed: 2 };
    return order[a.status] - order[b.status];
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {sortedSprints.map((sprint) => (
        <SprintCard
          key={sprint.id}
          sprint={sprint}
          tickets={ticketsBySprint[sprint.id] || []}
          completedStateIds={completedStateIds}
          onClick={() => onSprintClick(sprint)}
        />
      ))}
    </div>
  );
}
