"use client";

import { History } from "lucide-react";
import { useRouter } from "next/navigation";

import { NotificationList } from "@/components/notifications/notification-list";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDrawer } from "@/contexts/drawer/drawer-context";
import { useUser } from "@/hooks/use-user";
import { getNotificationUrl } from "@/lib/notification-utils";
import { useProjectNotifications } from "@/stores/notification.store";
import type { Notification } from "@/types/notification";

function ProjectHistoryContent({
  projectId,
  close,
}: {
  projectId: string;
  close: () => void;
}) {
  const router = useRouter();
  const { data: user } = useUser();
  const { data: notifications = [], isLoading } = useProjectNotifications(projectId);

  const handleNotificationClick = (notification: Notification) => {
    const url = getNotificationUrl(notification.type, notification.metadata);
    if (url) {
      close();
      router.push(url);
    }
  };

  return (
    <div className="flex flex-col h-full -mx-6 -my-5">
      <ScrollArea className="flex-1">
        <div className="px-3 py-2">
          <NotificationList
            notifications={notifications}
            isLoading={isLoading}
            onNotificationClick={handleNotificationClick}
            showReadIndicator={false}
            currentUserId={user?.id}
          />
        </div>
      </ScrollArea>
    </div>
  );
}

export function ProjectHistoryDrawer({ projectId }: { projectId: string }) {
  const { openDrawer } = useDrawer();

  const handleOpen = () => {
    openDrawer({
      title: "Project History",
      description: "Recent activity in this project",
      data: projectId,
      render: ({ data, close }) => (
        <ProjectHistoryContent projectId={data as string} close={close} />
      ),
    });
  };

  return (
    <Button variant="outline" size="sm" onClick={handleOpen}>
      <History className="h-4 w-4 mr-2" />
      History
    </Button>
  );
}
