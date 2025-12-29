"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import DeleteDialog from "@/components/delete-alert-dialog";
import { ProjectForm } from "@/components/projects/forms/project-form";
import { ProjectCard } from "@/components/projects/items/project-card-item";
import ProjectsSkeleton from "@/components/projects/projects-card-skeleton";
import { Button } from "@/components/ui/button";
import { useModal } from "@/contexts/modal-context";
import { useDeleteProject, useProjects } from "@/stores/project.store";
import MemberInviteCardItem from "@/components/members/member-invite-card-item";
import { useUser } from "@/hooks/use-user";
import { useShowUserInvites } from "@/stores/project-member.store";
import type { ProjectInvitesData } from "@/services/project-member.service";

export default function ProjectsPage() {
  const { data: projects = [], isLoading: projectLoading } = useProjects();
  const deleteProject = useDeleteProject();
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);

  const {data: user, isLoading: userLoading} = useUser();

  const { data: not, isLoading: invitesLoading } = useShowUserInvites(user?.id || "");

  const { openModal } = useModal();

  const handleDelete = async () => {
    if (!deletingProjectId) return;

    try {
      await deleteProject.mutateAsync(deletingProjectId);
      toast.success("Project deleted successfully");
      setDeletingProjectId(null);
    } catch (_) {
      toast.error(`Failed to delete project: ${deleteProject.error?.message}`);
    }
  };

  if (projectLoading || userLoading || invitesLoading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
        </div>
        <ProjectsSkeleton />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
          <p className="text-muted-foreground">
            Manage and organize your project boards
          </p>
        </div>
        <Button
          onClick={() =>
            openModal({
              title: "Create New Project",
              description: "Add a new project to organize your tickets",
              render: ({ close }) => <ProjectForm closeModal={close} />,
            })
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {Array.isArray(not) &&
        not.length &&
        not?.map((n) => (
          <MemberInviteCardItem
            key={n.invited_at}
            id={`${n?.id}`}
            profileId={n.invited_by}
            projectId={n.project_id}
            roleId={n.role_id}
          />
        ))}

      {not as ProjectInvitesData && (
        <MemberInviteCardItem
          key={`${not.invited_at}`}
          id={`${not?.id}`}
          profileId={`${not?.invited_by}`}
          projectId={`${not?.project_id}`}
          roleId={`${not?.role_id}`}
        />
      )}

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            No projects yet. Create your first project to get started!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={setDeletingProjectId}
            />
          ))}
        </div>
      )}

      <DeleteDialog
        description="This action cannot be undone. This will permanently delete the
            project and all associated tickets, states, and priorities."
        openState={!!deletingProjectId}
        onOpenChange={(open) => !open && setDeletingProjectId(null)}
        deleteAction={handleDelete}
      />
    </div>
  );
}
