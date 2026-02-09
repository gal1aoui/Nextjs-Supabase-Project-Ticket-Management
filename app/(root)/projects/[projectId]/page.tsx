"use client";

import { CalendarIcon, LayoutDashboard, Settings, UserPlus, Users } from "lucide-react";
import { use } from "react";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { CalendarView } from "@/components/calendar/calendar-view";
import EventForm from "@/components/events/forms/event-form";
import { InviteMemberDialog } from "@/components/members/invite-member-dialog";
import { MemberList } from "@/components/members/member-list";
import { PermissionGate } from "@/components/permission-gate";
import ProjectDetailSkeleton from "@/components/projects/project-detail/project-detail-skeleton";
import { ProjectStats } from "@/components/projects/project-detail/project-stats";
import { StatePriorityManager } from "@/components/projects/project-detail/state-priority-manager";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useModal } from "@/contexts/modal/modal-context";
import { useProjectPermissions } from "@/hooks/use-project-permissions";
import { useUser } from "@/hooks/use-user";
import { useProject } from "@/stores/project.store";

export default function ProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const { data: project, isLoading } = useProject(projectId);
  const { data: user, isLoading: userLoading } = useUser();

  const { openModal } = useModal();
  const { hasPermission } = useProjectPermissions(projectId);

  if (isLoading || userLoading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProjectDetailSkeleton />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div>Project not found</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div>Please log in to view this project</div>
      </div>
    );
  }

  const canManageEvents = hasPermission("manage_events");

  const handleCreateClick = (date: Date) => {
    openModal({
      title: "Schedule Event",
      description: "Create a new event for your project team",
      className: "sm:max-w-[50vw]",
      render: ({ close }) => (
        <EventForm
          defaultEventDate={date}
          projectId={projectId}
          closeModal={close}
        />
      ),
    });
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-6">
              <h2 className="text-3xl font-bold tracking-tight">{project.name}</h2>
              {project.color && (
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: project.color }} />
              )}
            </div>
            {project.description && (
              <p className="text-muted-foreground mt-1">{project.description}</p>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="board" className="space-y-4">
        <div className="flex justify-between">
          <TabsList>
            <TabsTrigger value="board">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Board
            </TabsTrigger>
            <TabsTrigger value="calendar">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="members">
              <Users className="h-4 w-4 mr-2" />
              Members
            </TabsTrigger>
            <PermissionGate projectId={projectId} permission={["manage_project", "manage_states", "manage_priorities", "manage_roles"]}>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </PermissionGate>
          </TabsList>
        </div>

        <TabsContent value="board" className="space-y-4">
          <ProjectStats projectId={projectId} />
          <KanbanBoard projectId={projectId} userId={`${user?.id}`} />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <CalendarView
            projectId={projectId}
            onCreateClick={canManageEvents ? handleCreateClick : undefined}
          />
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <div className="flex justify-end">
            <PermissionGate projectId={projectId} permission="manage_members">
              <Button
                onClick={() =>
                  openModal({
                    title: "Invite Team Member",
                    description: "Search for a user and assign them a role in your project",
                    render: ({ close }) => (
                      <InviteMemberDialog closeModal={close} projectId={projectId} />
                    ),
                  })
                }
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            </PermissionGate>
          </div>
          <MemberList projectId={projectId} currentUserId={user.id} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <ProjectStats projectId={projectId} />
          <StatePriorityManager projectId={projectId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
