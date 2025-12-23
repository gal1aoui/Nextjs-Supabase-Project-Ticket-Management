"use client";

import { Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useDeleteTicketPriority } from "@/stores/ticket-priority.store";
import type { TicketPriority } from "@/types/database";

interface PriorityItemProps {
  priority: TicketPriority;
  onEdit: () => void;
}

export default function PriorityItem({ priority, onEdit }: Readonly<PriorityItemProps>) {
  const deletePriority = useDeleteTicketPriority();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this priority?")) return;
    try {
      await deletePriority.mutateAsync(priority.id);
      toast.success("Priority deleted");
    } catch (_) {
      toast.error(`Failed to delete priority: ${deletePriority.error?.message}`);
    }
  };

  return (
    <div className="flex items-center justify-between p-2 rounded-lg border">
      <div className="flex items-center gap-2">
        {priority.color && (
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: priority.color }} />
        )}
        <span className="font-medium">{priority.name}</span>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={onEdit}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleDelete}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}
