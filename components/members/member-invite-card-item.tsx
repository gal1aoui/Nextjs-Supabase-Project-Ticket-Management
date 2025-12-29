"use client";

import { useProfile } from "@/stores/profile.store";
import UserAvatar from "../UserAvatar";
import { Button } from "../ui/button";
import { Check, UserX } from "lucide-react";
import { useRole } from "@/stores/role.store";
import { useProject } from "@/stores/project.store";
import { useAcceptMemberInvite } from "@/stores/project-member.store";
import { toast } from "sonner";

interface MemberInviteCardItemProps {
    id: string;
    profileId: string;
    projectId: string;
    roleId: string
}

export default function MemberInviteCardItem({id, profileId, projectId, roleId}: Readonly<MemberInviteCardItemProps>) {
    const {data: user} = useProfile(profileId);
    const {data: role} = useRole(roleId);
    const {data: project} = useProject(projectId);

    const acceptInvite = useAcceptMemberInvite();

    const handleAcceptInvite = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        await acceptInvite.mutateAsync(id);
        toast.success("Request Accepted");
      } catch (_){
        toast.error(`Failed to accept request: ${acceptInvite.error?.message}`);
      }
    };
  
    return (
      <div className="flex justify-between items-center">
        <UserAvatar />
        <p>
          {`${user?.full_name} invited you to join ${project?.name} Project as ${role?.name}`}
        </p>
        <div className="flex gap-2">
          <Button variant="destructive" size="icon">
            <UserX className="w-8 h-8" />
          </Button>
          <form onSubmit={handleAcceptInvite}>
            <Button variant="ghost" size="icon">
              <Check className="w-8 h-8" />
            </Button>
          </form>
        </div>
      </div>
    );
}
