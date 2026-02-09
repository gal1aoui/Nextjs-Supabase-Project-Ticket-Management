"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SingleMemberPicker } from "@/components/members/single-member-picker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useModalDialog } from "@/hooks/use-modal";
import { useCreateTicket } from "@/stores/ticket.store";
import type { TicketPriority } from "@/types/ticket-priority";
import type { TicketState } from "@/types/ticket-state";

interface CreateTicketDialogProps {
  projectId: string;
  states: TicketState[];
  priorities: TicketPriority[];
  userId: string;
}

export function CreateTicketDialog({
  projectId,
  states,
  priorities,
  userId,
}: CreateTicketDialogProps) {
  const { isOpen, toggleModal, closeModal } = useModalDialog();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [stateId, setStateId] = useState("");
  const [priorityId, setPriorityId] = useState("");
  const [assignedTo, setAssignedTo] = useState<string | null>(userId);

  const createTicket = useCreateTicket();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !stateId) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      await createTicket.mutateAsync({
        title,
        description: description || undefined,
        project_id: projectId,
        state_id: stateId,
        assigned_to: assignedTo || userId,
        priority_id: priorityId || undefined,
      });

      setTitle("");
      setDescription("");
      setStateId("");
      setPriorityId("");
      setAssignedTo(userId);
      closeModal();
      toast.success("Ticket created successfully");
    } catch (_) {
      toast.error(`Failed to create ticket: ${createTicket.error?.message}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={toggleModal}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Ticket</DialogTitle>
            <DialogDescription>Add a new ticket to your project board</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter ticket title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter ticket description"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="state">State *</Label>
              <Select value={stateId} onValueChange={setStateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state.id} value={state.id}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priorityId} onValueChange={setPriorityId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority.id} value={priority.id}>
                      {priority.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <SingleMemberPicker
              projectId={projectId}
              value={assignedTo}
              onChange={setAssignedTo}
              label="Assignee"
              placeholder="Search members to assign..."
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => closeModal()}>
              Cancel
            </Button>
            <Button type="submit" disabled={createTicket.isPending}>
              {createTicket.isPending ? "Creating..." : "Create Ticket"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
