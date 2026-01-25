import { type DragEvent, useCallback } from "react";
import { useDragDropContext } from "../drag-drop-context";
import type { DragData, UseCardDroppableProps } from "../types";
import { getClosestEdge } from "../utils";

export default function useCardDroppable<T>({ id, accept, item, onDrop }: UseCardDroppableProps<T>) {
  const { dragData, dropTarget, setDropTarget, endDrag } = useDragDropContext();

  const acceptTypes = Array.isArray(accept) ? accept : [accept];
  const canDrop = dragData !== null && acceptTypes.includes(dragData.type);

  // Check if this card is the current drop target
  const isOver = dropTarget?.id === id;
  const closestEdge = isOver ? dropTarget.edge : null;
  const draggingRect = isOver ? dropTarget.draggingRect : null;

  // Check if this is the card being dragged
  const isDraggingThis =
    dragData !== null && (dragData.item as { id: string }).id === (item as { id: string }).id;
  const hasLeftSelf = isDraggingThis && dropTarget !== null && dropTarget.id !== id;

  const handleDragOver = useCallback(
    (e: DragEvent<HTMLElement>) => {
      if (!canDrop) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";

      const edge = getClosestEdge(e);

      // Skip if dragging over self
      if (isDraggingThis) return;

      // Optimization: only update if edge changed
      if (dropTarget?.id === id && dropTarget?.edge === edge) return;

      setDropTarget({
        id,
        edge,
        draggingRect: dragData!.rect,
      });
    },
    [canDrop, isDraggingThis, id, dragData, dropTarget, setDropTarget]
  );

  const handleDragEnter = useCallback(
    (e: DragEvent<HTMLElement>) => {
      if (!canDrop || isDraggingThis) return;
      e.preventDefault();

      const edge = getClosestEdge(e);
      setDropTarget({
        id,
        edge,
        draggingRect: dragData!.rect,
      });
    },
    [canDrop, isDraggingThis, id, dragData, setDropTarget]
  );

  const handleDragLeave = useCallback(
    (e: DragEvent<HTMLElement>) => {
      const relatedTarget = e.relatedTarget as Node | null;
      if (e.currentTarget.contains(relatedTarget)) return;

      // Only clear if we're currently the target
      if (dropTarget?.id === id) {
        setDropTarget(null);
      }
    },
    [id, dropTarget, setDropTarget]
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLElement>) => {
      e.preventDefault();

      const jsonData = e.dataTransfer.getData("application/json");
      const data = JSON.parse(jsonData) as DragData<T>;
      const edge = getClosestEdge(e);

      if (acceptTypes.includes(data.type)) {
        // Don't drop on self
        if ((data.item as { id: string }).id !== (item as { id: string }).id) {
          onDrop(data.item, edge);
        }
      }

      setDropTarget(null);
      endDrag();
    },
    [acceptTypes, item, onDrop, setDropTarget, endDrag]
  );

  return {
    isOver,
    closestEdge,
    draggingRect,
    isDraggingThis,
    hasLeftSelf,
    droppableProps: {
      onDragOver: handleDragOver,
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
  };
}