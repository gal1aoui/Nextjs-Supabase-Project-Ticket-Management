import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sprintService } from "@/services/sprint.service";
import type { Sprint, SprintCreate, SprintUpdate } from "@/types/sprint";

export const sprintKeys = {
  byProject: (projectId: string) => ["sprints", projectId] as const,
  detail: (id: string) => ["sprints", "detail", id] as const,
  active: (projectId: string) => ["sprints", "active", projectId] as const,
};

export function useSprints(projectId: string) {
  return useQuery({
    queryKey: sprintKeys.byProject(projectId),
    queryFn: () => sprintService.getByProject(projectId) as Promise<Sprint[]>,
    enabled: !!projectId,
  });
}

export function useSprint(id: string) {
  return useQuery({
    queryKey: sprintKeys.detail(id),
    queryFn: () => sprintService.getById(id) as Promise<Sprint>,
    enabled: !!id,
  });
}

export function useActiveSprint(projectId: string) {
  return useQuery({
    queryKey: sprintKeys.active(projectId),
    queryFn: () => sprintService.getActive(projectId),
    enabled: !!projectId,
  });
}

export function useCreateSprint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SprintCreate) => sprintService.create(data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: sprintKeys.byProject(variables.project_id) });
      qc.invalidateQueries({ queryKey: sprintKeys.active(variables.project_id) });
    },
  });
}

export function useUpdateSprint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SprintUpdate) => sprintService.update(data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: sprintKeys.byProject(data.project_id) });
      qc.invalidateQueries({ queryKey: sprintKeys.detail(data.id) });
      qc.invalidateQueries({ queryKey: sprintKeys.active(data.project_id) });
    },
  });
}

export function useDeleteSprint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sprintService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sprints"] });
    },
  });
}
