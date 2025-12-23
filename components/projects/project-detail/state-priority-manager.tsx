"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { MemberList } from "@/components/members/member-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/hooks/use-user";
import { useTicketPriorities } from "@/stores/ticket-priority.store";
import { useTicketStates } from "@/stores/ticket-state.store";
import type { TicketPriority, TicketState } from "@/types/database";
import PriorityDialog from "./priority-dialog";
import PriorityItem from "./priority-item";
import StateDialog from "./state-dialog";
import StateItem from "./state-item";

interface StatePriorityManagerProps {
  projectId: string;
}

export function StatePriorityManager({ projectId }: StatePriorityManagerProps) {
  const { data: states = [] } = useTicketStates(projectId);
  const { data: priorities = [] } = useTicketPriorities(projectId);

  const { data: user } = useUser();

  const [stateDialog, setStateDialog] = useState<{ open: boolean; state?: TicketState }>({
    open: false,
  });
  const [priorityDialog, setPriorityDialog] = useState<{
    open: boolean;
    priority?: TicketPriority;
  }>({ open: false });

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Ticket States</CardTitle>
          <Button size="sm" onClick={() => setStateDialog({ open: true })}>
            <Plus className="h-4 w-4 mr-1" />
            Add State
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {states.length === 0 ? (
              <p className="text-sm text-muted-foreground">No states yet</p>
            ) : (
              states.map((state) => (
                <StateItem
                  key={state.id}
                  state={state}
                  onEdit={() => setStateDialog({ open: true, state })}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Ticket Priorities</CardTitle>
          <Button size="sm" onClick={() => setPriorityDialog({ open: true })}>
            <Plus className="h-4 w-4 mr-1" />
            Add Priority
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {priorities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No priorities yet</p>
            ) : (
              priorities.map((priority) => (
                <PriorityItem
                  key={priority.id}
                  priority={priority}
                  onEdit={() => setPriorityDialog({ open: true, priority })}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>
      {stateDialog.open && (
        <StateDialog
          projectId={projectId}
          state={stateDialog.state}
          open={stateDialog.open}
          onOpenChange={(open) => setStateDialog({ open })}
        />
      )}
      {priorityDialog.open && (
        <PriorityDialog
          projectId={projectId}
          priority={priorityDialog.priority}
          open={priorityDialog.open}
          onOpenChange={(open) => setPriorityDialog({ open })}
        />
      )}
      <MemberList projectId={projectId} currentUserId={user!.id!} />
    </div>
  );
}
