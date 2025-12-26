"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ModalState } from "@/contexts/modal-context";

interface ModalRootProps {
  open: boolean;
  state: ModalState;
  close: () => void;
}

export function ModalRoot({ open, state, close }: ModalRootProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && close()}>
      <DialogContent>
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
