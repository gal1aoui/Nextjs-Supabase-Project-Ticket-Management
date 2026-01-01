"use client";

import { AvatarImage } from "@radix-ui/react-avatar";
import { useUser } from "@/hooks/use-user";
import { getUserInitials } from "@/lib/helpers";
import type { Profile } from "@/types/database";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Skeleton } from "./ui/skeleton";

interface UserAvatarProps {
  user?: Profile;
  isLoading?: boolean;
}

export default function UserAvatar({ user, isLoading }: Readonly<UserAvatarProps>) {
  const { data: currentUser, isLoading: currentUserLoadingState } = useUser();
  const data = {
    user: user?.full_name ?? currentUser?.user_metadata.name,
    isLoading: isLoading ?? currentUserLoadingState,
  };

  if (isLoading) {
    return <Skeleton className="h-8 w-8 rounded-full relative" />;
  }

  return (
    <Avatar>
      <AvatarImage src={data.user?.avatar_url || undefined} />
      <AvatarFallback className="bg-primary text-primary-foreground">
        {getUserInitials(data.user)}
      </AvatarFallback>
    </Avatar>
  );
}
