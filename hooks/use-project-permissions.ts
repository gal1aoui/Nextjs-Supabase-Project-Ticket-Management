import { useMemo } from "react";
import { useUser } from "@/hooks/use-user";
import { useProjectMembers } from "@/stores/project-member.store";
import { useRoles } from "@/stores/role.store";
import type { PermissionKey } from "@/types/role";

export function useProjectPermissions(projectId: string) {
  const { data: user } = useUser();
  const { data: members, isLoading: membersLoading } = useProjectMembers(projectId);
  const { data: roles, isLoading: rolesLoading } = useRoles();

  const { membership, role, permissions } = useMemo(() => {
    const membership = members?.find((m) => m.user_id === user?.id && m.status === "active");
    const role = roles?.find((r) => r.id === membership?.role_id);
    const permissions = (role?.permissions ?? []) as string[];

    return { membership, role, permissions };
  }, [members, roles, user?.id]);

  const hasPermission = useMemo(
    () => (permission: PermissionKey | string) => permissions.includes(permission),
    [permissions]
  );

  return {
    role,
    permissions,
    hasPermission,
    isOwner: role?.name === "Owner",
    isMember: !!membership,
    isLoading: membersLoading || rolesLoading,
  };
}
