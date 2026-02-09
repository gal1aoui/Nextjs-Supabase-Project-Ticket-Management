"use client";

import { createContext, type ReactNode, useCallback, useContext, useState } from "react";
import { DrawerRoot } from "@/contexts/drawer/components/drawer-root";

export type DrawerState = {
  title?: ReactNode;
  description?: ReactNode;
  data?: unknown;
  render?: (args: {
    // biome-ignore lint/suspicious/noExplicitAny: the data can be of any type
    data: any;
    close: () => void;
  }) => ReactNode;
};

type DrawerContextType = {
  openDrawer: <T>(config: {
    title?: ReactNode;
    description?: ReactNode;
    data?: T;
    render: (args: { data: T; close: () => void }) => ReactNode;
  }) => void;
  closeDrawer: () => void;
};

const DrawerContext = createContext<DrawerContextType | null>(null);

export function DrawerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<DrawerState>({});

  const openDrawer = useCallback((config: DrawerState) => {
    setState(config);
    setOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <DrawerContext.Provider value={{ openDrawer, closeDrawer }}>
      {children}
      <DrawerRoot open={open} state={state} close={closeDrawer} />
    </DrawerContext.Provider>
  );
}

export function useDrawer() {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error("useDrawer must be used inside DrawerProvider");
  return ctx;
}
