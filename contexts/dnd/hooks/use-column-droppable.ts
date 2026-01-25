import { type DragEvent, useCallback } from "react";
import { useDragDropContext } from "../drag-drop-context";
import type { DragData, UseColumnDroppableProps } from "../types";

export function useColumnDroppable<T>({ accept, onDrop }: UseColumnDroppableProps<T>) {
  const { dragData, dropTarget, setDropTarget, endDrag } = useDragDropContext();

  const acceptTypes = Array.isArray(accept) ? accept : [accept];
  const canDrop = dragData !== null && acceptTypes.includes(dragData.type);

  // Column is "over" when dragging and no card is the specific target
  // (meaning we're over the column background, not a card)
  const isCardOver = canDrop && dropTarget === null;
  const draggingRect = dragData?.rect ?? null;

  const handleDragOver = useCallback(
    (e: DragEvent<HTMLElement>) => {
      if (!canDrop) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    },
    [canDrop]
  );

  const handleDragEnter = useCallback(
    (e: DragEvent<HTMLElement>) => {
      if (!canDrop) return;
      e.preventDefault();
      // Clear any card-specific drop target when entering column
      // (but not if already over a card)
    },
    [canDrop]
  );

  const handleDragLeave = useCallback(
    (e: DragEvent<HTMLElement>) => {
      const relatedTarget = e.relatedTarget as Node | null;
      if (e.currentTarget.contains(relatedTarget)) return;

      setDropTarget(null);
    },
    [setDropTarget]
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLElement>) => {
      e.preventDefault();

      // Only handle drop on column if no specific card target
      if (dropTarget !== null) return;

      const jsonData = e.dataTransfer.getData("application/json");
      const data = JSON.parse(jsonData) as DragData<T>;

      if (acceptTypes.includes(data.type)) {
        onDrop(data.item);
      }

      setDropTarget(null);
      endDrag();
    },
    [acceptTypes, dropTarget, onDrop, setDropTarget, endDrag]
  );

  return {
    isCardOver,
    draggingRect,
    droppableProps: {
      onDragOver: handleDragOver,
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
  };
}