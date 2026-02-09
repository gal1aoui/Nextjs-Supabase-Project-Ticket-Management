"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { DrawerState } from "@/contexts/drawer/drawer-context";

interface DrawerRootProps {
  open: boolean;
  state: DrawerState;
  close: () => void;
}

export function DrawerRoot({ open, state, close }: DrawerRootProps) {
  return (
    <Sheet open={open} onOpenChange={(v) => !v && close()}>
      <SheetContent side="right" className="sm:max-w-lg w-full overflow-y-auto p-0">
        {(state.title || state.description) && (
          <SheetHeader className="px-6 pt-6 pb-4 border-b">
            {state.title && <SheetTitle>{state.title}</SheetTitle>}
            {state.description && <SheetDescription>{state.description}</SheetDescription>}
          </SheetHeader>
        )}

        <div className="px-6 py-5">
          {state.render?.({
            data: state.data,
            close,
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
