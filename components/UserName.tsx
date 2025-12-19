"use client";

import { useUser } from "@/hooks/use-user";
import { Skeleton } from "./ui/skeleton";

export default function UserName() {
  const { data: user, isLoading } = useUser();
  if (isLoading) {
    return <Skeleton className="h-6 w-2xs rounded-md"></Skeleton>;
  }
  return (
    <h2 className="text-3xl font-bold tracking-tight flex gap-2 items-center">
      Good morning, {user?.user_metadata.name}
    </h2>
  );
}
