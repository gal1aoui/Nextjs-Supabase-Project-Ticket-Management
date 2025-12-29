"use client";

import { Calendar, MoreVertical, Ticket } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useModal } from "@/contexts/modal-context";
import { useProjectStats } from "@/stores/project.store";
import type { Project } from "@/types/database";
import { ProjectForm } from "../forms/project-form";

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const { data: stats } = useProjectStats(project.id);
  const { openModal } = useModal();
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          {project.color && (
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
          )}
          <CardTitle className="text-xl font-semibold">{project.name}</CardTitle>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() =>
                openModal({
                  title: "Edit Project",
                  description: "Update your project information",
                  render: ({ close }) => <ProjectForm project={project} closeModal={close} />,
                })
              }
            >
              Edit Project
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(project.id)} className="text-destructive">
              Delete Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {project.description || "No description provided"}
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Ticket className="h-4 w-4" />
            <span>{stats?.totalTickets || 0} tickets</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{new Date(project.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/projects/${project.id}`} className="w-full">
          <Button className="w-full">View Board</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
