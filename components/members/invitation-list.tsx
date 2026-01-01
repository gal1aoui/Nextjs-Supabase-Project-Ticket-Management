"use client";

import { Clock } from "lucide-react";
import { usePendingInvitations } from "@/stores/project-member.store";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import InvitationItem from "./items/invitation-item";

export default function MemberInviteCardItem() {
  const { data: pendingInvitations, isLoading } = usePendingInvitations();

  if (isLoading) {
    return <div>Loading invitations...</div>;
  }

  if (pendingInvitations?.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Pending Invitations ({pendingInvitations?.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pendingInvitations?.map((invitation) => (
            <InvitationItem
              key={invitation.id}
              invitationId={invitation.id}
              profileId={invitation.invited_by || ""}
              projectId={invitation.project_id}
              roleId={invitation.role_id}
              invitationDate={invitation.invited_at}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
