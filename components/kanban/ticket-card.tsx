"use client";

import { useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Ticket, TicketPriority } from "@/types/database";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import { pointerOutsideOfPreview } from "@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview";

interface TicketCardProps {
  ticket: Ticket;
  priority?: TicketPriority;
  assigneeInitials?: string;
  onclick?: () => void;
}

export function TicketCard({
  ticket,
  priority,
  assigneeInitials,
  onclick,
}: TicketCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    const dragHandle = dragHandleRef.current;
    if (!el || !dragHandle) return;

    return draggable({
      element: el,
      dragHandle,
      getInitialData: () => ({ ticket }),
      onGenerateDragPreview: ({ nativeSetDragImage }) => {
        setCustomNativeDragPreview({
          nativeSetDragImage,
          getOffset: pointerOutsideOfPreview({ x: "16px", y: "16px" }),
          render: ({ container }) => {
            const preview = el.cloneNode(true) as HTMLElement;
            preview.style.width = `${el.offsetWidth}px`;
            preview.style.transform = "rotate(3deg)";
            container.appendChild(preview);
          },
        });
      },
    });
  }, [ticket]);

  return (
    <Card
      ref={cardRef}
      onClick={onclick}
      className="cursor-pointer transition-colors hover:bg-accent"
    >
      <CardContent className="p-3">
        <div ref={dragHandleRef} className="cursor-grab active:cursor-grabbing">
          <p className="text-sm font-medium mb-2">{ticket.title}</p>
          <div className="flex items-center justify-between">
            {priority && (
              <Badge
                variant="secondary"
                className="text-xs"
                style={{
                  backgroundColor: priority.color || undefined,
                  color: priority.color
                    ? getContrastColor(priority.color)
                    : undefined,
                }}
              >
                {priority.name}
              </Badge>
            )}
            {assigneeInitials && (
              <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                {assigneeInitials}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getContrastColor(hexColor: string): string {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}
