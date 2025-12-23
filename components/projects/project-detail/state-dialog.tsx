import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateTicketState, useUpdateTicketState } from "@/stores/ticket-state.store";
import type { TicketState } from "@/types/database";

interface StateDialogProps {
  projectId: string;
  state?: TicketState;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function StateDialog({
  projectId,
  state,
  open,
  onOpenChange,
}: Readonly<StateDialogProps>) {
  const [name, setName] = useState(state?.name || "");
  const [color, setColor] = useState(state?.color || "#3B82F6");

  const createState = useCreateTicketState();
  const updateState = useUpdateTicketState();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    try {
      if (state) {
        await updateState.mutateAsync({ id: state.id, name, color });
        toast.success("State updated");
      } else {
        await createState.mutateAsync({ name, color, project_id: projectId });
        toast.success("State created");
      }
      onOpenChange(false);
      setName("");
      setColor("#3B82F6");
    } catch (_) {
      toast.error("Failed to save state");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{state ? "Edit" : "Create"} State</DialogTitle>
            <DialogDescription>
              {state ? "Update" : "Add a new"} ticket state for this project
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="state-name">Name</Label>
              <Input
                id="state-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="To Do"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="state-color">Color</Label>
              <div className="flex gap-2">
                <Input
                  id="state-color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-20 h-10"
                />
                <Input value={color} onChange={(e) => setColor(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{state ? "Update" : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
