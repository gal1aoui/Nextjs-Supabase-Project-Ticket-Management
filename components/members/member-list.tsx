"use client";

import { Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useProjectMembers, useRemoveMember } from "@/stores/project-member.store";
import ActiveMemberItem from "./items/active-member-item";
import PendingMemberItem from "./items/pending-member-item";

interface MemberListProps {
  projectId: string;
  currentUserId: string;
}

export function MemberList({ projectId, currentUserId }: MemberListProps) {
  const { data: members = [], isLoading } = useProjectMembers(projectId);

  const removeMember = useRemoveMember();
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  const handleRemoveMember = async () => {
    if (!removingMemberId) return;

    try {
      await removeMember.mutateAsync(removingMemberId);
      toast.success("Member removed from project");
      setRemovingMemberId(null);
    } catch (_) {
      toast.error(`Failed to remove member: ${removeMember.error?.message}`);
    }
  };

  if (isLoading) {
    return <div>Loading members...</div>;
  }

  const activeMembers = members.filter((m) => m.status === "active");
  const pendingMembers = members.filter((m) => m.status === "pending");

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members ({activeMembers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeMembers.map((member) => (
                <ActiveMemberItem
                  key={member.user_id}
                  user_id={member.user_id}
                  role_id={member.role_id}
                  status={member.status}
                  currentUserId={currentUserId}
                  setRemovingMemberId={setRemovingMemberId}
                />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {pendingMembers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations ({pendingMembers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingMembers.map((member) => (
                <PendingMemberItem
                  key={member.user_id}
                  user_id={member.user_id}
                  invited_at={member.invited_at}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <AlertDialog
        open={!!removingMemberId}
        onOpenChange={(open) => !open && setRemovingMemberId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this member from the project? They will lose access to
              all project resources.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
