"use client";

import { AlertCircle, ListTodo, Ticket } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjectStats } from "@/stores/project.store";
import ProjectsCardSkeleton from "../projects-card-skeleton";

interface ProjectStatsProps {
  projectId: string;
}

export function ProjectStats({ projectId }: ProjectStatsProps) {
  const { data: stats, isLoading } = useProjectStats(projectId);

  if (isLoading) {
    return <ProjectsCardSkeleton style="h-48 rounded-xl mb-12" />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
          <Ticket className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalTickets || 0}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">States</CardTitle>
          <ListTodo className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.stateStats.length || 0}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {stats?.stateStats.map((s) => `${s.name}: ${s.count}`).join(", ")}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Priorities</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.priorityStats.length || 0}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {stats?.priorityStats.map((p) => `${p.name}: ${p.count}`).join(", ")}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
