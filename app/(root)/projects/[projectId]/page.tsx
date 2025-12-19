"use client";

import { LayoutDashboard } from "lucide-react";
import { use } from "react";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { ProjectStats } from "@/components/projects/project-detail/project-stats";
import { StatePriorityManager } from "@/components/projects/project-detail/state-priority-manager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProject } from "@/stores/project.store";
import ProjectDetailSkeleton from "@/components/projects/project-detail/project-detail-skeleton";
import { useUser } from "@/hooks/use-user";

export default function ProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const { data: project, isLoading } = useProject(projectId);
  const { data: user, isLoading: userLoading } = useUser();

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
        <TabsList>
          <TabsTrigger value="board">
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Board
          </TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="space-y-4">
          <ProjectStats projectId={projectId} />
          <KanbanBoard projectId={projectId} userId={`${user?.id}`} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <ProjectStats projectId={projectId} />
          <StatePriorityManager projectId={projectId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
