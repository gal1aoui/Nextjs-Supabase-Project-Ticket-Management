"use client";

import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateProject, useUpdateProject } from "@/stores/project.store";
import type { Project } from "@/types/database";
import { type ProjectFormSchema, projectFormSchema } from "@/types/project";

interface ProjectFormProps {
  project?: Project;
  closeModal: () => void;
}

export function ProjectForm({ project, closeModal }: ProjectFormProps) {
  const [form, setForm] = useState<ProjectFormSchema>({
    name: project?.name ?? "",
    description: project?.description ?? "",
    color: project?.color ?? "#3B82F6",
  });

  const [error, setError] = useState<string | undefined>(undefined);

  const updateProject = useUpdateProject();
  const createProject = useCreateProject();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = projectFormSchema.safeParse(form);
    if (!parsed.success) {
      setError(z.treeifyError(parsed.error).properties?.name?.errors[0] ?? undefined);
      return;
    }

    try {
      if (project) {
        await updateProject.mutateAsync({
          id: project.id,
          name: form.name,
          description: form.description,
          color: form.color,
        });
      } else {
        await createProject.mutateAsync({
          name: form.name,
          description: form.description,
          color: form.color,
        });
      }
      closeModal();
      toast.success(`Project ${project ? "updated" : "created"} successfully`);
    } catch (_) {
      toast.error(
        `Failed to ${project ? "update" : "create"} project: ${project ? updateProject.error?.message : createProject.error?.message}`
      );
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Project Name *</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) =>
              setForm((prev) => {
                return { ...prev, name: e.target.value };
              })
            }
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) =>
              setForm((prev) => {
                return { ...prev, description: e.target.value };
              })
            }
            rows={3}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="color">Project Color</Label>
          <div className="flex gap-2">
            <Input
              id="color"
              type="color"
              value={form.color}
              onChange={(e) =>
                setForm((prev) => {
                  return { ...prev, color: e.target.value };
                })
              }
              className="w-20 h-10"
            />
            <Input
              value={form.color}
              onChange={(e) =>
                setForm((prev) => {
                  return { ...prev, color: e.target.value };
                })
              }
            />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => closeModal()}>
          Cancel
        </Button>
        <Button type="submit" disabled={updateProject.isPending || createProject.isPending}>
          {project ? "Update" : "Create"}
        </Button>
      </DialogFooter>
    </form>
  );
}
