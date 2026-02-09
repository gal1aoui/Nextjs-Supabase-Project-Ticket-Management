"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { Textarea } from "@/components/ui/textarea";
import { useModalDialog } from "@/hooks/use-modal";
import { useCreateSprint } from "@/stores/sprint.store";
import type { DateRange } from "react-day-picker";

interface CreateSprintDialogProps {
  projectId: string;
}

export function CreateSprintDialog({ projectId }: CreateSprintDialogProps) {
  const { isOpen, toggleModal, closeModal } = useModalDialog();
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const createSprint = useCreateSprint();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !dateRange?.from || !dateRange?.to) {
      toast.error("Please fill in the sprint name and date range");
      return;
    }

    try {
      await createSprint.mutateAsync({
        name,
        goal: goal || undefined,
        project_id: projectId,
        start_date: dateRange.from.toISOString().split("T")[0],
        end_date: dateRange.to.toISOString().split("T")[0],
      });

      setName("");
      setGoal("");
      setDateRange(undefined);
      closeModal();
      toast.success("Sprint created successfully");
    } catch (_) {
      toast.error(`Failed to create sprint: ${createSprint.error?.message}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={toggleModal}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Sprint
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Sprint</DialogTitle>
            <DialogDescription>Plan a new sprint for your project</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="sprint-name">Name *</Label>
              <Input
                id="sprint-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Sprint 1"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sprint-goal">Goal</Label>
              <Textarea
                id="sprint-goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="What should this sprint achieve?"
                rows={2}
              />
            </div>
            <div className="grid gap-2">
              <Label>Date Range *</Label>
              <div className="flex justify-center border rounded-md p-2">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={1}
                  disabled={{ before: new Date() }}
                />
              </div>
              {dateRange?.from && dateRange?.to && (
                <p className="text-xs text-muted-foreground text-center">
                  {dateRange.from.toLocaleDateString()} — {dateRange.to.toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={createSprint.isPending}>
              {createSprint.isPending ? "Creating..." : "Create Sprint"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
