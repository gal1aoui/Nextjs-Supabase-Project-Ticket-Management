"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LogOut, Menu } from "lucide-react";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { AppSidebar } from "@/components/AppSidebar";
import { Logo } from "@/components/Logo";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import UserAvatar from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { DrawerProvider } from "@/contexts/drawer/drawer-context";
import { ModalProvider } from "@/contexts/modal/modal-context";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { profileService } from "@/services/profile.service";

const ThemeToggle = dynamic(() => import("@/components/ThemeToggle"), {
  loading: () => <Spinner className="size-8" />,
  ssr: false,
});

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const handleLogout = async () => {
    const result = await profileService.signOut();

    if (result?.error) {
      toast.error(result.error.message);
      return;
    }

    toast.success("Logged out successfully");
    redirect("/login");
  };
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <DrawerProvider>
        <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <div className="flex flex-1 flex-col">
            <header className="border-b border-border bg-card">
              <div className="flex h-16 items-center justify-between px-6">
                <div className="flex items-center gap-4">
                  <SidebarTrigger>
                    <Menu className="h-5 w-5" />
                  </SidebarTrigger>
                  <Logo size={150} />
                </div>

                <div className="flex items-center gap-4">
                  <NotificationDropdown />
                  <ThemeToggle />

                  <UserAvatar />

                  <Button variant="ghost" size="icon" onClick={handleLogout}>
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </header>
            <ModalProvider>
              {children}
            </ModalProvider>
          </div>
        </div>
        </SidebarProvider>
        </DrawerProvider>
      </NotificationProvider>
    </QueryClientProvider>
  );
}
