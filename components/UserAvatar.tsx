"use client";

import type { User } from "@supabase/supabase-js";
import { useUser } from "@/hooks/use-user";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Skeleton } from "./ui/skeleton";

interface UserAvatarProps {
  user?: User | null;
  isLoading?: boolean;
}

export default function UserAvatar({ user, isLoading }: Readonly<UserAvatarProps>) {
  const { data: currentUser, isLoading: currentUserLoadingState } = useUser();
  const data = {
    user: user ?? currentUser,
    isLoading: isLoading ?? currentUserLoadingState,
  };

  const getInitials = () => {
    return `${data.user?.user_metadata.name}`
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (isLoading) {
    return <Skeleton className="h-8 w-8 rounded-full relative" />;
  }

  return (
    <Avatar>
      <AvatarFallback className="bg-primary text-primary-foreground">
        {getInitials()}
      </AvatarFallback>
    </Avatar>
  );
}
