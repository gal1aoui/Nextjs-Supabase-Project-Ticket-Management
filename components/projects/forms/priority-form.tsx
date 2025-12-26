"use client";

import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateTicketPriority, useUpdateTicketPriority } from "@/stores/ticket-priority.store";
import type { TicketPriority } from "@/types/database";
import { type TicketPriorityFormSchema, ticketPriorityFormSchema } from "@/types/ticket-priority";

interface PriorityFormProps {
  projectId: string;
  priority?: TicketPriority;
  closeModal: () => void;
}

export default function PriorityForm({
  projectId,
  priority,
  closeModal,
}: Readonly<PriorityFormProps>) {
  const [form, setForm] = useState<TicketPriorityFormSchema>({
    name: priority?.name || "",
    color: priority?.color || "#3B82F6",
  });
  const [error, setError] = useState<string | undefined>(undefined);

  const createPriority = useCreateTicketPriority(projectId);
  const updatePriority = useUpdateTicketPriority();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = ticketPriorityFormSchema.safeParse(form);
    if (!parsed.success) {
      setError(z.treeifyError(parsed.error).properties?.name?.errors[0] ?? undefined);
      return;
    }

    try {
      if (priority) {
        await updatePriority.mutateAsync({
          id: priority.id,
          name: form.name,
          color: form.color,
        });
      } else {
        await createPriority.mutateAsync({
          name: form.name,
          color: form.color,
        });
      }
      closeModal();
      toast.success(`Project ${priority ? "updated" : "created"} successfully`);
    } catch (_) {
      toast.error(
        `Failed to ${priority ? "update" : "create"} priority: ${priority ? updatePriority.error?.message : createPriority.error?.message}`
      );
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="state-name">Name</Label>
          <Input
            id="state-name"
            value={form.name}
            onChange={(e) =>
              setForm((prev) => {
                return { ...prev, name: e.target.value };
              })
            }
            placeholder="To Do"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="state-color">Color</Label>
          <div className="flex gap-2">
            <Input
              id="state-color"
              type="color"
              value={form.color}
              onChange={(e) =>
                setForm((prev) => {
                  return { ...prev, color: e.target.value };
                })
              }
              className="w-20 h-10"
            />
            <Input
              value={form.color}
              onChange={(e) =>
                setForm((prev) => {
                  return { ...prev, color: e.target.value };
                })
              }
            />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => closeModal}>
          Cancel
        </Button>
        <Button type="submit">{priority ? "Update" : "Create"}</Button>
      </DialogFooter>
    </form>
  );
}
