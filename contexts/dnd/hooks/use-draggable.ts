import { type DragEvent, useCallback } from "react";
import { useDragDropContext } from "../drag-drop-context";
import type { UseDraggableProps } from "../types";

export function useDraggable<T>({ type, item, onDragStart, onDragEnd }: UseDraggableProps<T>) {
  const { startDrag, endDrag } = useDragDropContext();

  const handleDragStart = useCallback(
    (e: DragEvent<HTMLElement>) => {
      e.dataTransfer.effectAllowed = "move";

      const rect = e.currentTarget.getBoundingClientRect();
      e.dataTransfer.setData("application/json", JSON.stringify({ type, item, rect }));

      // Set drag image offset to center-top of element
      if (e.currentTarget instanceof HTMLElement) {
        e.dataTransfer.setDragImage(e.currentTarget, rect.width / 2, 20);
      }

      startDrag(type, item, rect);
      onDragStart?.();
    },
    [type, item, startDrag, onDragStart]
  );

  const handleDragEnd = useCallback(() => {
    endDrag();
    onDragEnd?.();
  }, [endDrag, onDragEnd]);

  return {
    draggableProps: {
      draggable: true,
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd,
    },
  };
}