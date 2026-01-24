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

export interface DragData<T = unknown> {
  type: string;
  item: T;
}

interface DragDropState {
  isDragging: boolean;
  dragData: DragData | null;
  activeDropZone: string | null;
}

interface DragDropContextType extends DragDropState {
  startDrag: <T>(type: string, item: T) => void;
  endDrag: () => void;
  setActiveDropZone: (zoneId: string | null) => void;
}

// ===========================================
// Context
// ===========================================

const DragDropContext = createContext<DragDropContextType | null>(null);

export function DragDropProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DragDropState>({
    isDragging: false,
    dragData: null,
    activeDropZone: null,
  });

  const startDrag = useCallback(<T,>(type: string, item: T) => {
    setState({
      isDragging: true,
      dragData: { type, item },
      activeDropZone: null,
    });
  }, []);

  const endDrag = useCallback(() => {
    setState({
      isDragging: false,
      dragData: null,
      activeDropZone: null,
    });
  }, []);

  const setActiveDropZone = useCallback((zoneId: string | null) => {
    setState((prev) => ({ ...prev, activeDropZone: zoneId }));
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
      // Set drag data for native HTML5 drag and drop
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("application/json", JSON.stringify({ type, item }));

      // Add drag image styling
      if (e.currentTarget instanceof HTMLElement) {
        const rect = e.currentTarget.getBoundingClientRect();
        e.dataTransfer.setDragImage(e.currentTarget, rect.width / 2, 20);
      }

      // Update context state
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
  onDrop: (item: T, e: DragEvent<HTMLElement>) => void;
  onDragEnter?: () => void;
  onDragLeave?: () => void;
}

export function useDroppable<T>({
  id,
  accept,
  onDrop,
  onDragEnter,
  onDragLeave,
}: UseDroppableOptions<T>) {
  const { dragData, activeDropZone, setActiveDropZone, endDrag } = useDragDropContext();

  const acceptTypes = Array.isArray(accept) ? accept : [accept];
  const isOver = activeDropZone === id;
  const canDrop = dragData !== null && acceptTypes.includes(dragData.type);

  const handleDragOver = useCallback(
    (e: DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    },
    []
  );

  const handleDragEnter = useCallback(
    (e: DragEvent<HTMLElement>) => {
      e.preventDefault();
      setActiveDropZone(id);
      onDragEnter?.();
    },
    [id, setActiveDropZone, onDragEnter]
  );

  const handleDragLeave = useCallback(
    (e: DragEvent<HTMLElement>) => {
      // Only trigger leave if we're actually leaving the element
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

      if (acceptTypes.includes(data.type)) {
        onDrop(data.item, e);
      }

      setActiveDropZone(null);
      endDrag();
    },
    [acceptTypes, onDrop, setActiveDropZone, endDrag],
  );

  return {
    isOver,
    canDrop,
    droppableProps: {
      onDragOver: handleDragOver,
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
  };
}
