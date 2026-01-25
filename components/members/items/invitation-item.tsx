import { formatDate } from "date-fns";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import UserAvatar from "@/components/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useProfile } from "@/stores/profile.store";
import { useProject } from "@/stores/project.store";
import {
  useAcceptMemberInvitation,
  useDeclineMemberInvitation,
} from "@/stores/project-member.store";
import { useRole } from "@/stores/role.store";

interface InvitationItemProps {
  invitationId: string;
  profileId: string;
  projectId: string;
  roleId: string;
  invitationDate: string;
}

export default function InvitationItem({
  invitationId,
  profileId,
  roleId,
  projectId,
  invitationDate,
}: Readonly<InvitationItemProps>) {
  const { data: user } = useProfile(profileId);
  const { data: role } = useRole(roleId);
  const { data: project } = useProject(projectId);
  const acceptInvitation = useAcceptMemberInvitation(projectId);
  const declineInvitation = useDeclineMemberInvitation();

  const handleAcceptInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await acceptInvitation.mutateAsync(invitationId);
      toast.success("Request Accepted");
    } catch (_) {
      toast.error(`Failed to accept request: ${acceptInvitation.error?.message}`);
    }
  };

  const handleDeclineInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await declineInvitation.mutateAsync(invitationId);
      toast.success("Request Accepted");
    } catch (_) {
      toast.error(`Failed to accept request: ${declineInvitation.error?.message}`);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: project?.color || "#3B82F6",
              }}
            />
            <h3 className="font-semibold">{project?.name}</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            {project?.description || "No description"}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <UserAvatar user={user} />
              <span>Invited by {user?.full_name}</span>
            </div>
            <Badge variant="secondary">{role?.name}</Badge>
            <span>{formatDate(new Date(invitationDate), "MMM d, yyyy")}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleAcceptInvite} disabled={acceptInvitation.isPending}>
            <Check className="h-4 w-4 mr-1" />
            Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDeclineInvite}
            disabled={declineInvitation.isPending}
          >
            <X className="h-4 w-4 mr-1" />
            Decline
          </Button>
        </div>
      </div>
    </Card>
  );
}
