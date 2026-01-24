"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type DragEvent,
  type ReactNode,
} from "react";

// ===========================================
// Types
// ===========================================

export type DragDirection = "free" | "horizontal" | "vertical";

export interface DragData<T = unknown> {
  type: string;
  item: T;
}

export type DropPosition = "before" | "after" | "inside";

interface DragDropState {
  isDragging: boolean;
  dragData: DragData | null;
  activeDropZone: string | null;
  dropPosition: DropPosition | null;
  direction: DragDirection;
}

interface DragDropContextType extends DragDropState {
  startDrag: <T>(type: string, item: T) => void;
  endDrag: () => void;
  setActiveDropZone: (zoneId: string | null, position?: DropPosition) => void;
}

// ===========================================
// Context
// ===========================================

const DragDropContext = createContext<DragDropContextType | null>(null);

interface DragDropProviderProps {
  children: ReactNode;
  direction?: DragDirection;
}

export function DragDropProvider({ children, direction = "free" }: DragDropProviderProps) {
  const [state, setState] = useState<DragDropState>({
    isDragging: false,
    dragData: null,
    activeDropZone: null,
    dropPosition: null,
    direction,
  });

  const startDrag = useCallback(<T,>(type: string, item: T) => {
    setState((prev) => ({
      ...prev,
      isDragging: true,
      dragData: { type, item },
      activeDropZone: null,
      dropPosition: null,
    }));
  }, []);

  const endDrag = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isDragging: false,
      dragData: null,
      activeDropZone: null,
      dropPosition: null,
    }));
  }, []);

  const setActiveDropZone = useCallback((zoneId: string | null, position?: DropPosition) => {
    setState((prev) => ({
      ...prev,
      activeDropZone: zoneId,
      dropPosition: position ?? null,
    }));
  }, []);

  return (
    <DragDropContext.Provider value={{ ...state, startDrag, endDrag, setActiveDropZone }}>
      {children}
    </DragDropContext.Provider>
  );
}

export function useDragDropContext() {
  const context = useContext(DragDropContext);
  if (!context) {
    throw new Error("useDragDropContext must be used within DragDropProvider");
  }
  return context;
}

// ===========================================
// Draggable Hook
// ===========================================

interface UseDraggableOptions<T> {
  type: string;
  item: T;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export function useDraggable<T>({ type, item, onDragStart, onDragEnd }: UseDraggableOptions<T>) {
  const { startDrag, endDrag } = useDragDropContext();

  const handleDragStart = useCallback(
    (e: DragEvent<HTMLElement>) => {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("application/json", JSON.stringify({ type, item }));

      if (e.currentTarget instanceof HTMLElement) {
        const rect = e.currentTarget.getBoundingClientRect();
        e.dataTransfer.setDragImage(e.currentTarget, rect.width / 2, 20);
      }

      startDrag(type, item);
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

// ===========================================
// Droppable Hook
// ===========================================

interface UseDroppableOptions<T> {
  id: string;
  accept: string | string[];
  onDrop: (item: T, position: DropPosition, e: DragEvent<HTMLElement>) => void;
  onDragEnter?: () => void;
  onDragLeave?: () => void;
}

function getDropPosition(
  e: DragEvent<HTMLElement>,
  direction: DragDirection
): DropPosition {
  const rect = e.currentTarget.getBoundingClientRect();

  if (direction === "horizontal") {
    const x = e.clientX - rect.left;
    const threshold = rect.width / 2;
    return x < threshold ? "before" : "after";
  }

  if (direction === "vertical") {
    const y = e.clientY - rect.top;
    const threshold = rect.height / 2;
    return y < threshold ? "before" : "after";
  }

  // Free direction - determine based on closest edge
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const xRatio = x / rect.width;
  const yRatio = y / rect.height;

  // If in the center area, return "inside"
  if (xRatio > 0.25 && xRatio < 0.75 && yRatio > 0.25 && yRatio < 0.75) {
    return "inside";
  }

  // Otherwise, determine before/after based on dominant axis
  if (Math.abs(xRatio - 0.5) > Math.abs(yRatio - 0.5)) {
    return xRatio < 0.5 ? "before" : "after";
  }
  return yRatio < 0.5 ? "before" : "after";
}

export function useDroppable<T>({
  id,
  accept,
  onDrop,
  onDragEnter,
  onDragLeave,
}: UseDroppableOptions<T>) {
  const { dragData, activeDropZone, dropPosition, direction, setActiveDropZone, endDrag } =
    useDragDropContext();

  const acceptTypes = Array.isArray(accept) ? accept : [accept];
  const isOver = activeDropZone === id;
  const canDrop = dragData !== null && acceptTypes.includes(dragData.type);

  const handleDragOver = useCallback(
    (e: DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";

      // Update drop position based on cursor location
      const position = getDropPosition(e, direction);
      if (activeDropZone === id) {
        setActiveDropZone(id, position);
      }
    },
    [id, direction, activeDropZone, setActiveDropZone]
  );

  const handleDragEnter = useCallback(
    (e: DragEvent<HTMLElement>) => {
      e.preventDefault();
      const position = getDropPosition(e, direction);
      setActiveDropZone(id, position);
      onDragEnter?.();
    },
    [id, direction, setActiveDropZone, onDragEnter]
  );

  const handleDragLeave = useCallback(
    (e: DragEvent<HTMLElement>) => {
      const relatedTarget = e.relatedTarget as Node | null;
      if (e.currentTarget.contains(relatedTarget)) return;

      setActiveDropZone(null);
      onDragLeave?.();
    },
    [setActiveDropZone, onDragLeave]
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLElement>) => {
      e.preventDefault();

      const jsonData = e.dataTransfer.getData("application/json");
      const data = JSON.parse(jsonData) as DragData<T>;
      const position = getDropPosition(e, direction);

      if (acceptTypes.includes(data.type)) {
        onDrop(data.item, position, e);
      }

      setActiveDropZone(null);
      endDrag();
    },
    [acceptTypes, direction, onDrop, setActiveDropZone, endDrag]
  );

  return {
    isOver,
    canDrop,
    dropPosition: isOver ? dropPosition : null,
    direction,
    droppableProps: {
      onDragOver: handleDragOver,
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
  };
}

