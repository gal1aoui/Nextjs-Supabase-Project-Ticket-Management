"use client";

import { Plus } from "lucide-react";
import { MemberList } from "@/components/members/member-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useModal } from "@/contexts/modal-context";
import { useUser } from "@/hooks/use-user";
import { useTicketPriorities } from "@/stores/ticket-priority.store";
import { useTicketStates } from "@/stores/ticket-state.store";
import PriorityForm from "../forms/priority-form";
import StateForm from "../forms/state-form";
import PriorityItem from "../items/priority-card-item";
import StateItem from "../items/state-card-item";

interface StatePriorityManagerProps {
  projectId: string;
}

export function StatePriorityManager({ projectId }: StatePriorityManagerProps) {
  const { data: states = [] } = useTicketStates(projectId);
  const { data: priorities = [] } = useTicketPriorities(projectId);

  const { openModal } = useModal();

  const { data: user } = useUser();

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Ticket States</CardTitle>
          <Button
            size="sm"
            onClick={() =>
              openModal({
                title: "Create State",
                description: "Add a new ticket state for this project",
                render: ({ close }) => <StateForm projectId={projectId} closeModal={close} />,
              })
            }
          >
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
                  onEdit={() =>
                    openModal({
                      title: "Edit State",
                      description: "Update ticket state for this project",
                      render: ({ close }) => (
                        <StateForm projectId={projectId} closeModal={close} state={state} />
                      ),
                    })
                  }
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Ticket Priorities</CardTitle>
          <Button
            size="sm"
            onClick={() =>
              openModal({
                title: "Create Priority",
                description: "Add a new ticket priority for this project",
                render: ({ close }) => <PriorityForm projectId={projectId} closeModal={close} />,
              })
            }
          >
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
                  onEdit={() =>
                    openModal({
                      title: "Create Priority",
                      description: "Add a new ticket priority for this project",
                      render: ({ close }) => (
                        <PriorityForm
                          projectId={projectId}
                          closeModal={close}
                          priority={priority}
                        />
                      ),
                    })
                  }
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>
      <MemberList projectId={projectId} currentUserId={user!.id!} />
    </div>
  );
}
