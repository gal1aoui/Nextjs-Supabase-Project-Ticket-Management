"use client";

import dynamic from "next/dynamic";
import { Spinner } from "@/components/ui/spinner";

const ThemeToggle = dynamic(() => import("@/components/ThemeToggle"), {
  loading: () => <Spinner className="size-8" />,
  ssr: false,
});

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      {children}
    </div>
  );
}
