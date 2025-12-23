import { Crown, UserX } from "lucide-react";
import { toast } from "sonner";
import { useProfile } from "@/stores/profile.store";
import { useUpdateMember } from "@/stores/project-member.store";
import { useRole, useRoles } from "@/stores/role.store";
import UserAvatar from "../UserAvatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { TableCell, TableRow } from "../ui/table";

interface ActiveMemberItemProps {
  user_id: string;
  role_id: string;
  status: string;
  currentUserId: string;
  setRemovingMemberId: (id: string) => void;
}

export default function ActiveMemberItem({
  user_id,
  role_id,
  status,
  currentUserId,
  setRemovingMemberId,
}: ActiveMemberItemProps) {
  const { data: user } = useProfile(user_id);
  const { data: role } = useRole(role_id);
  const updateMember = useUpdateMember();
  const { data: roles = [] } = useRoles();

  const handleRoleChange = async (memberId: string, roleId: string) => {
    try {
      await updateMember.mutateAsync({ id: memberId, role_id: roleId });
      toast.success("Member role updated");
    } catch (_) {
      toast.error(`Failed to update role: ${updateMember.error?.message}`);
    }
  };

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <UserAvatar />
          <div>
            <div className="font-medium">{user?.full_name || "Unknown User"}</div>
            {user?.id === currentUserId && (
              <Badge variant="secondary" className="text-xs">
                You
              </Badge>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">@{user?.username || "no-username"}</TableCell>
      <TableCell>
        <Select
          value={role?.id}
          onValueChange={(value) => handleRoleChange(user!.id, value)}
          disabled={user?.id === currentUserId}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role.id} value={role.id}>
                <div className="flex items-center gap-2">
                  {role.name === "Admin" && <Crown className="h-3 w-3" />}
                  {role.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Badge variant="default">{status}</Badge>
      </TableCell>
      <TableCell>
        {user?.id !== currentUserId && (
          <Button variant="ghost" size="icon" onClick={() => setRemovingMemberId(user!.id)}>
            <UserX className="h-4 w-4 text-destructive" />
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}
