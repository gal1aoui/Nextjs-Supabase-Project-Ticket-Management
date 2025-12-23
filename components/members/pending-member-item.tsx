import { useProfile } from "@/stores/profile.store";
import UserAvatar from "../UserAvatar";
import { Badge } from "../ui/badge";

interface PendingMemberItemProps {
  user_id: string;
  invited_at: string;
}

export default function PendingMemberItem({ user_id, invited_at }: PendingMemberItemProps) {
  const { data: user } = useProfile(user_id);
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-3">
        <UserAvatar />
        <div>
          <div className="font-medium">{user?.full_name || "Unknown User"}</div>
          <div className="text-xs text-muted-foreground">
            Invited {new Date(invited_at).toLocaleDateString()}
          </div>
        </div>
      </div>
      <Badge variant="outline">Pending</Badge>
    </div>
  );
}
