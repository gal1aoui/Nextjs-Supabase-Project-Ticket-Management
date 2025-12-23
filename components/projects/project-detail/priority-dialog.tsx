"use client";

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
import { useCreateTicketPriority, useUpdateTicketPriority } from "@/stores/ticket-priority.store";
import type { TicketPriority } from "@/types/database";

interface PriorityDialogProps {
  projectId: string;
  priority?: TicketPriority;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PriorityDialog({
  projectId,
  priority,
  open,
  onOpenChange,
}: Readonly<PriorityDialogProps>) {
  const [name, setName] = useState(priority?.name || "");
  const [color, setColor] = useState(priority?.color || "#F59E0B");
  console.log("color: ", color);

  const createPriority = useCreateTicketPriority();
  const updatePriority = useUpdateTicketPriority();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    try {
      if (priority) {
        await updatePriority.mutateAsync({ id: priority.id, name, color });
        toast.success("Priority updated");
      } else {
        await createPriority.mutateAsync({ name, color, project_id: projectId });
        toast.success("Priority created");
      }
      onOpenChange(false);
      setName("");
      setColor("#F59E0B");
    } catch (_) {
      toast.error("Failed to save priority");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{priority ? "Edit" : "Create"} Priority</DialogTitle>
            <DialogDescription>
              {priority ? "Update" : "Add a new"} ticket priority for this project
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="priority-name">Name</Label>
              <Input
                id="priority-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="High"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priority-color">Color</Label>
              <div className="flex gap-2">
                <Input
                  id="priority-color"
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
            <Button type="submit">{priority ? "Update" : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
