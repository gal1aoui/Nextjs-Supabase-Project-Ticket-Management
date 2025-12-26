"use client";

import { CalendarIcon, LayoutDashboard, Users } from "lucide-react";
import { use, useState } from "react";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { CalendarView } from "@/components/meetings/calendar-view";
import { CreateMeetingDialog } from "@/components/meetings/create-meeting-dialog";
import { MeetingDetailDialog } from "@/components/meetings/meeting-detail-dialog";
import { InviteMemberDialog } from "@/components/members/invite-member-dialog";
import { MemberList } from "@/components/members/member-list";
import ProjectDetailSkeleton from "@/components/projects/project-detail/project-detail-skeleton";
import { ProjectStats } from "@/components/projects/project-detail/project-stats";
import { StatePriorityManager } from "@/components/projects/project-detail/state-priority-manager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/hooks/use-user";
import type { MeetingWithRelations } from "@/lib/utils";
import { useProject } from "@/stores/project.store";

export default function ProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const { data: project, isLoading } = useProject(projectId);
  const { data: user, isLoading: userLoading } = useUser();

  const [createMeetingOpen, setCreateMeetingOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingWithRelations | null>(null);
  const [defaultMeetingDate, setDefaultMeetingDate] = useState<Date | undefined>();

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

  const handleCreateClick = (date: Date) => {
    setDefaultMeetingDate(date);
    setCreateMeetingOpen(true);
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
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <InviteMemberDialog projectId={projectId} />
        </div>

        <TabsContent value="board" className="space-y-4">
          <ProjectStats projectId={projectId} />
          <KanbanBoard projectId={projectId} userId={`${user?.id}`} />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <CalendarView
            projectId={projectId}
            onMeetingClick={setSelectedMeeting}
            onCreateClick={handleCreateClick}
          />
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <div className="flex justify-end">
            <InviteMemberDialog projectId={projectId} />
          </div>
          <MemberList projectId={projectId} currentUserId={user.id} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <ProjectStats projectId={projectId} />
          <StatePriorityManager projectId={projectId} />
        </TabsContent>
      </Tabs>

      {createMeetingOpen && (
        <CreateMeetingDialog
          projectId={projectId}
          open={createMeetingOpen}
          onOpenChange={setCreateMeetingOpen}
          defaultDate={defaultMeetingDate}
        />
      )}

      <MeetingDetailDialog
        meeting={selectedMeeting}
        open={!!selectedMeeting}
        onOpenChange={(open) => !open && setSelectedMeeting(null)}
      />
    </div>
  );
}
