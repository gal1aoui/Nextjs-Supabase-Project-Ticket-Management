"use client";

import { UserX } from "lucide-react";
import { toast } from "sonner";
import { PermissionGate } from "@/components/permission-gate";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProjectPermissions } from "@/hooks/use-project-permissions";
import { useProfile } from "@/stores/profile.store";
import { useUpdateMember } from "@/stores/project-member.store";
import { useProjectRoles, useRole } from "@/stores/role.store";
import UserAvatar from "../../UserAvatar";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { TableCell, TableRow } from "../../ui/table";

interface ActiveMemberItemProps {
  id: string;
  user_id: string;
  role_id: string;
  status: string;
  currentUserId: string;
  projectId: string;
  setRemovingMemberId: (id: string) => void;
}

export default function ActiveMemberItem({
  id,
  user_id,
  role_id,
  status,
  currentUserId,
  projectId,
  setRemovingMemberId,
}: ActiveMemberItemProps) {
  const { data: user } = useProfile(user_id);
  const { data: role } = useRole(role_id);
  const { data: roles = [] } = useProjectRoles(projectId);
  const { hasPermission } = useProjectPermissions(projectId);
  const updateMember = useUpdateMember();

  const isCurrentUser = user?.id === currentUserId;
  const isOwner = role?.name === "Owner";
  const canChangeRole = hasPermission("manage_members") && !isCurrentUser && !isOwner;

  const handleRoleChange = async (newRoleId: string) => {
    try {
      await updateMember.mutateAsync({ id, role_id: newRoleId });
      toast.success("Role updated successfully");
    } catch (_) {
      toast.error("Failed to update role");
    }
  };

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <UserAvatar user={user} />
          <div>
            <div className="font-medium">{user?.full_name || "Unknown User"}</div>
            {isCurrentUser && (
              <Badge variant="secondary" className="text-xs">
                You
              </Badge>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">@{user?.username || "no-username"}</TableCell>
      <TableCell>
        {canChangeRole ? (
          <Select value={role_id} onValueChange={handleRoleChange}>
            <SelectTrigger className="w-[140px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roles.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          role?.name
        )}
      </TableCell>
      <TableCell>
        <Badge variant="default">{status}</Badge>
      </TableCell>
      <TableCell>
        {!isCurrentUser && (
          <PermissionGate projectId={projectId} permission="manage_members">
            <Button variant="ghost" size="icon" onClick={() => setRemovingMemberId(id)}>
              <UserX className="h-4 w-4 text-destructive" />
            </Button>
          </PermissionGate>
        )}
      </TableCell>
    </TableRow>
  );
}
