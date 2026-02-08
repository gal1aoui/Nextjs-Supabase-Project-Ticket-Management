import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { roleService } from "@/services/role.service";
import type { RoleCreate, RoleUpdate } from "@/types/role";

export const roleKeys = {
  all: ["roles"] as const,
  byId: (id: string) => ["roles", id] as const,
  byProject: (projectId: string) => ["roles", "project", projectId] as const,
};

export function useRoles() {
  return useQuery({
    queryKey: roleKeys.all,
    queryFn: () => roleService.getAll(),
  });
}

export function useRole(id: string) {
  return useQuery({
    queryKey: roleKeys.byId(id),
    queryFn: () => roleService.getById(id),
    enabled: !!id,
  });
}

export function useProjectRoles(projectId: string) {
  return useQuery({
    queryKey: roleKeys.byProject(projectId),
    queryFn: () => roleService.getByProject(projectId),
    enabled: !!projectId,
  });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: RoleCreate) => roleService.create(data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: roleKeys.byProject(variables.project_id) });
      qc.invalidateQueries({ queryKey: roleKeys.all });
    },
  });
}

export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: RoleUpdate) => roleService.update(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}

export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => roleService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}
