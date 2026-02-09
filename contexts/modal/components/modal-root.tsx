"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ModalState } from "@/contexts/modal/modal-context";
import { cn } from "@/lib/utils";

interface ModalRootProps {
  open: boolean;
  state: ModalState;
  close: () => void;
}

export function ModalRoot({ open, state, close }: ModalRootProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && close()}>
      <DialogContent className={cn("max-h-[85vh] overflow-y-auto", state.className)}>
        {(state.title || state.description) && (
          <DialogHeader>
            {state.title && <DialogTitle>{state.title}</DialogTitle>}
            {state.description && <DialogDescription>{state.description}</DialogDescription>}
          </DialogHeader>
        )}

        {state.render?.({
          data: state.data,
          close,
        })}
      </DialogContent>
    </Dialog>
  );
}
