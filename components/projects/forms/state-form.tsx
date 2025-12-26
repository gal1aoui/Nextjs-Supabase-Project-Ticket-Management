import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateTicketState, useUpdateTicketState } from "@/stores/ticket-state.store";
import type { TicketState } from "@/types/database";
import { type TicketStateFormSchema, ticketStateFormSchema } from "@/types/ticket-state";

interface StateDialogProps {
  projectId: string;
  state?: TicketState;
  closeModal: () => void;
}

export default function StateForm({ projectId, state, closeModal }: Readonly<StateDialogProps>) {
  const [form, setForm] = useState<TicketStateFormSchema>({
    name: state?.name || "",
    color: state?.color || "#3B82F6",
  });
  const [error, setError] = useState<string | undefined>(undefined);

  const createState = useCreateTicketState(projectId);
  const updateState = useUpdateTicketState();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = ticketStateFormSchema.safeParse(form);
    if (!parsed.success) {
      setError(z.treeifyError(parsed.error).properties?.name?.errors[0] ?? undefined);
      return;
    }

    try {
      if (state) {
        await updateState.mutateAsync({
          id: state.id,
          name: form.name,
          color: form.color,
        });
      } else {
        await createState.mutateAsync({ name: form.name, color: form.color });
      }
      closeModal();
      toast.success(`Project ${state ? "updated" : "created"} successfully`);
    } catch (_) {
      toast.error(
        `Failed to ${state ? "update" : "create"} state: ${state ? updateState.error?.message : createState.error?.message}`
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
        <Button type="submit">{state ? "Update" : "Create"}</Button>
      </DialogFooter>
    </form>
  );
}
