import type { CheckedState } from "@radix-ui/react-checkbox";
import { useProfile } from "@/stores/profile.store";
import { useRole } from "@/stores/role.store";
import UserAvatar from "../../UserAvatar";
import { Checkbox } from "../../ui/checkbox";

interface MeetingAttendeesMemberItemProps {
  userId: string;
  roleId: string;
  includeAttendee: CheckedState | undefined;
  toggleAttendee: () => void;
}

export default function MeetingAttendeesMemberItem({
  userId,
  roleId,
  includeAttendee,
  toggleAttendee,
}: Readonly<MeetingAttendeesMemberItemProps>) {
  const { data: profile } = useProfile(userId);
  const { data: role } = useRole(roleId);
  return (
    <div className="flex items-center gap-3">
      <Checkbox checked={includeAttendee} onCheckedChange={toggleAttendee} />
      <UserAvatar user={profile} />
      <div className="flex-1">
        <div className="text-sm font-medium">{profile?.full_name}</div>
        <div className="text-xs text-muted-foreground">{role?.name}</div>
      </div>
    </div>
  );
}
