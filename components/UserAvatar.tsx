"use client";

import { Avatar, AvatarFallback } from "./ui/avatar";
import { Skeleton } from "./ui/skeleton";
import { useUser } from "@/hooks/use-user";

export default function UserAvatar() {
  const { data: user, isLoading } = useUser()
  const getInitials = (name: string) => {
    return name
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
        {user && getInitials(user.user_metadata.name)}
      </AvatarFallback>
    </Avatar>
  );
}
