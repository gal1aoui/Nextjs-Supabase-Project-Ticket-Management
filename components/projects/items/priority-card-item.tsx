"use client";

import type { TicketPriority } from "@/types/database";

interface PriorityItemProps {
  priority: TicketPriority;
  onEdit: () => void;
}

export default function PriorityItem({
  priority,
  onEdit,
}: Readonly<PriorityItemProps>) {
  return (
    <button
      className="w-full flex items-center justify-between p-4 rounded-lg border cursor-pointer"
      onClick={onEdit}
      type="button"
    >
      <div className="flex items-center gap-2">
        {priority.color && (
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: priority.color }}
          />
        )}
        <span className="font-medium">{priority.name}</span>
      </div>
    </button>
  );
}
