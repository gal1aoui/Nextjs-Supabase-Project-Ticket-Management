import { useQuery } from "@tanstack/react-query";
import { roleService } from "@/services/role.service";

export const roleKeys = {
  all: ["roles"] as const,
  byId: (id: string) => ["roles", id] as const,
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
