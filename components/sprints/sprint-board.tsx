"use client";

import { ArrowLeft, Edit } from "lucide-react";
import { useState } from "react";
import { PermissionGate } from "@/components/permission-gate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProjectPermissions } from "@/hooks/use-project-permissions";
import { useSprints } from "@/stores/sprint.store";
import type { Sprint } from "@/types/sprint";
import { BacklogPanel } from "./backlog-panel";
import { CreateSprintDialog } from "./create-sprint-dialog";
import { EditSprintDialog } from "./edit-sprint-dialog";
import { SprintList } from "./sprint-list";
import { SprintTicketList } from "./sprint-ticket-list";

interface SprintBoardProps {
  projectId: string;
}

export function SprintBoard({ projectId }: SprintBoardProps) {
  const { data: sprints = [], isLoading } = useSprints(projectId);
  const { hasPermission } = useProjectPermissions(projectId);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);

  const canManage = hasPermission("manage_sprints") || hasPermission("manage_tickets");

  // Detail view for a selected sprint
  if (selectedSprint) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSelectedSprint(null)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{selectedSprint.name}</h3>
                <Badge
                  variant={
                    selectedSprint.status === "active"
                      ? "default"
                      : selectedSprint.status === "completed"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {selectedSprint.status}
                </Badge>
              </div>
              {selectedSprint.goal && (
                <p className="text-sm text-muted-foreground">{selectedSprint.goal}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(selectedSprint.start_date).toLocaleDateString()} —{" "}
                {new Date(selectedSprint.end_date).toLocaleDateString()}
              </p>
            </div>
          </div>

          <PermissionGate projectId={projectId} permission="manage_sprints">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingSprint(selectedSprint)}
            >
              <Edit className="h-4 w-4 mr-1.5" />
              Edit Sprint
            </Button>
          </PermissionGate>
        </div>

        <SprintTicketList
          projectId={projectId}
          sprintId={selectedSprint.id}
          canManage={canManage}
        />

        <BacklogPanel
          projectId={projectId}
          sprints={sprints}
          canManage={canManage}
        />

        <EditSprintDialog
          sprint={editingSprint}
          open={!!editingSprint}
          onOpenChange={(open) => {
            if (!open) {
              setEditingSprint(null);
              // Refresh sprint data
              const updated = sprints.find((s) => s.id === selectedSprint.id);
              if (updated) setSelectedSprint(updated);
            }
          }}
        />
      </div>
    );
  }

  // List view showing all sprints
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Sprints</h2>
        <PermissionGate projectId={projectId} permission="manage_sprints">
          <CreateSprintDialog projectId={projectId} />
        </PermissionGate>
      </div>

      <SprintList
        sprints={sprints}
        projectId={projectId}
        isLoading={isLoading}
        onSprintClick={setSelectedSprint}
      />

      <BacklogPanel
        projectId={projectId}
        sprints={sprints}
        canManage={canManage}
      />
    </div>
  );
}
