"use client";

import { UserX } from "lucide-react";
import { useProfile } from "@/stores/profile.store";
import { useRole } from "@/stores/role.store";
import UserAvatar from "../../UserAvatar";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { TableCell, TableRow } from "../../ui/table";

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

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <UserAvatar user={user} />
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
      <TableCell>{role?.name}</TableCell>
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
