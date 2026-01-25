"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import type { DragDropState, DropTargetState } from "./types";

interface DragDropContextType extends DragDropState {
  startDrag: <T>(type: string, item: T, rect: DOMRect) => void;
  endDrag: () => void;
  setDropTarget: (target: DropTargetState | null) => void;
}

const DragDropContext = createContext<DragDropContextType | null>(null);

interface DragDropProviderProps {
  children: ReactNode;
}

export function DragDropProvider({ children }: DragDropProviderProps) {
  const [state, setState] = useState<DragDropState>({
    isDragging: false,
    dragData: null,
    dropTarget: null,
  });

  const startDrag = useCallback(<T,>(type: string, item: T, rect: DOMRect) => {
    setState({
      isDragging: true,
      dragData: { type, item, rect },
      dropTarget: null,
    });
  }, []);

  const endDrag = useCallback(() => {
    setState({
      isDragging: false,
      dragData: null,
      dropTarget: null,
    });
  }, []);

  const setDropTarget = useCallback((target: DropTargetState | null) => {
    setState((prev) => ({
      ...prev,
      dropTarget: target,
    }));
  }, []);

  return (
    <DragDropContext.Provider value={{ ...state, startDrag, endDrag, setDropTarget }}>
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
