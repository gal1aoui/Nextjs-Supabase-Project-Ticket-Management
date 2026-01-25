export type Edge = "top" | "bottom";

export interface DragData<T = unknown> {
  type: string;
  item: T;
  rect: DOMRect;
}

export interface DropTargetState {
  id: string;
  edge: Edge;
  draggingRect: DOMRect;
}

export interface DragDropState {
  isDragging: boolean;
  dragData: DragData | null;
  dropTarget: DropTargetState | null;
}

export interface UseDraggableProps<T> {
  type: string;
  item: T;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export interface UseCardDroppableProps<T> {
  id: string;
  accept: string | string[];
  item: T;
  onDrop: (draggedItem: T, edge: Edge) => void;
}

export interface UseColumnDroppableProps<T> {
  accept: string | string[];
  onDrop: (draggedItem: T) => void;
}