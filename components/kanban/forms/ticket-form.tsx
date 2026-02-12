"use client";

import { useState } from "react";
import { toast } from "sonner";
import { SingleMemberPicker } from "@/components/members/single-member-picker";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
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
import { useCreateTicket, useUpdateTicket } from "@/stores/ticket.store";
import type { Ticket } from "@/types/ticket";
import type { TicketPriority } from "@/types/ticket-priority";
import type { TicketState } from "@/types/ticket-state";

interface TicketFormProps {
  ticket?: Ticket;
  projectId: string;
  states: TicketState[];
  priorities: TicketPriority[];
  userId: string;
  closeModal: () => void;
}

export function TicketForm({
  ticket,
  projectId,
  states,
  priorities,
  userId,
  closeModal,
}: TicketFormProps) {
  const [title, setTitle] = useState(ticket?.title ?? "");
  const [description, setDescription] = useState(ticket?.description ?? "");
  const [stateId, setStateId] = useState(ticket?.state_id ?? "");
  const [priorityId, setPriorityId] = useState(ticket?.priority_id ?? "");
  const [assignedTo, setAssignedTo] = useState<string | null>(
    ticket?.assigned_to ?? userId
  );

  const createTicket = useCreateTicket();
  const updateTicket = useUpdateTicket();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !stateId) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      if (ticket) {
        await updateTicket.mutateAsync({
          id: ticket.id,
          title,
          description: description || undefined,
          state_id: stateId,
          priority_id: priorityId || undefined,
          assigned_to: assignedTo || undefined,
        });
      } else {
        await createTicket.mutateAsync({
          title,
          description: description || undefined,
          project_id: projectId,
          state_id: stateId,
          assigned_to: assignedTo || userId,
          priority_id: priorityId || undefined,
        });
      }
      closeModal();
      toast.success(`Ticket ${ticket ? "updated" : "created"} successfully`);
    } catch (_) {
      toast.error(
        `Failed to ${ticket ? "update" : "create"} ticket: ${ticket ? updateTicket.error?.message : createTicket.error?.message}`
      );
    }
  };

  const isPending = createTicket.isPending || updateTicket.isPending;

  return (
    <form onSubmit={handleSubmit}>
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
        <Button type="submit" disabled={isPending}>
          {ticket ? "Update" : "Create"}
        </Button>
      </DialogFooter>
    </form>
  );
}
