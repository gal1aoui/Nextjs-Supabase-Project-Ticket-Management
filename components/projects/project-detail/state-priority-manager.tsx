"use client";

import { Edit, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  useCreateTicketPriority,
  useDeleteTicketPriority,
  useTicketPriorities,
  useUpdateTicketPriority,
} from "@/stores/ticket-priority.store";
import {
  useCreateTicketState,
  useDeleteTicketState,
  useTicketStates,
  useUpdateTicketState,
} from "@/stores/ticket-state.store";
import type { TicketPriority, TicketState } from "@/types/database";

interface StatePriorityManagerProps {
  projectId: string;
}

export function StatePriorityManager({ projectId }: StatePriorityManagerProps) {
  const { data: states = [] } = useTicketStates(projectId);
  const { data: priorities = [] } = useTicketPriorities(projectId);

  const [stateDialog, setStateDialog] = useState<{ open: boolean; state?: TicketState }>({
    open: false,
  });
  const [priorityDialog, setPriorityDialog] = useState<{
    open: boolean;
    priority?: TicketPriority;
  }>({ open: false });

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Ticket States</CardTitle>
          <Button size="sm" onClick={() => setStateDialog({ open: true })}>
            <Plus className="h-4 w-4 mr-1" />
            Add State
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {states.length === 0 ? (
              <p className="text-sm text-muted-foreground">No states yet</p>
            ) : (
              states.map((state) => (
                <StateItem
                  key={state.id}
                  state={state}
                  onEdit={() => setStateDialog({ open: true, state })}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Ticket Priorities</CardTitle>
          <Button size="sm" onClick={() => setPriorityDialog({ open: true })}>
            <Plus className="h-4 w-4 mr-1" />
            Add Priority
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {priorities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No priorities yet</p>
            ) : (
              priorities.map((priority) => (
                <PriorityItem
                  key={priority.id}
                  priority={priority}
                  onEdit={() => setPriorityDialog({ open: true, priority })}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <StateDialog
        projectId={projectId}
        state={stateDialog.state}
        open={stateDialog.open}
        onOpenChange={(open) => setStateDialog({ open })}
      />

      <PriorityDialog
        projectId={projectId}
        priority={priorityDialog.priority}
        open={priorityDialog.open}
        onOpenChange={(open) => setPriorityDialog({ open })}
      />
    </div>
  );
}

function StateItem({ state, onEdit }: { state: TicketState; onEdit: () => void }) {
  const deleteState = useDeleteTicketState();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this state?")) return;
    try {
      await deleteState.mutateAsync(state.id);
      toast.success("State deleted");
    } catch (_) {
      toast.error("Failed to delete state");
    }
  };

  return (
    <div className="flex items-center justify-between p-2 rounded-lg border">
      <div className="flex items-center gap-2">
        {state.color && (
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: state.color }} />
        )}
        <span className="font-medium">{state.name}</span>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={onEdit}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleDelete}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

function PriorityItem({ priority, onEdit }: { priority: TicketPriority; onEdit: () => void }) {
  const deletePriority = useDeleteTicketPriority();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this priority?")) return;
    try {
      await deletePriority.mutateAsync(priority.id);
      toast.success("Priority deleted");
    } catch (_) {
      toast.error("Failed to delete priority");
    }
  };

  return (
    <div className="flex items-center justify-between p-2 rounded-lg border">
      <div className="flex items-center gap-2">
        {priority.color && (
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: priority.color }} />
        )}
        <span className="font-medium">{priority.name}</span>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={onEdit}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleDelete}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

function StateDialog({
  projectId,
  state,
  open,
  onOpenChange,
}: {
  projectId: string;
  state?: TicketState;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
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

function PriorityDialog({
  projectId,
  priority,
  open,
  onOpenChange,
}: {
  projectId: string;
  priority?: TicketPriority;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = useState(priority?.name || "");
  const [color, setColor] = useState(priority?.color || "#F59E0B");

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
