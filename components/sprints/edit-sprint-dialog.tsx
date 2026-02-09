"use client";

import { useEffect, useState } from "react";
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
import { useUpdateSprint } from "@/stores/sprint.store";
import type { Sprint, SprintStatus } from "@/types/sprint";
import type { DateRange } from "react-day-picker";

interface EditSprintDialogProps {
  sprint: Sprint | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditSprintDialog({ sprint, open, onOpenChange }: EditSprintDialogProps) {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [status, setStatus] = useState<SprintStatus>("planning");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const updateSprint = useUpdateSprint();

  useEffect(() => {
    if (sprint) {
      setName(sprint.name);
      setGoal(sprint.goal || "");
      setStatus(sprint.status);
      setDateRange({
        from: new Date(sprint.start_date),
        to: new Date(sprint.end_date),
      });
    }
  }, [sprint]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sprint || !name || !dateRange?.from || !dateRange?.to) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      await updateSprint.mutateAsync({
        id: sprint.id,
        name,
        goal: goal || undefined,
        status,
        start_date: dateRange.from.toISOString().split("T")[0],
        end_date: dateRange.to.toISOString().split("T")[0],
      });

      onOpenChange(false);
      toast.success("Sprint updated successfully");
    } catch (_) {
      toast.error(`Failed to update sprint: ${updateSprint.error?.message}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Sprint</DialogTitle>
            <DialogDescription>Update sprint details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-sprint-name">Name *</Label>
              <Input
                id="edit-sprint-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sprint name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-sprint-goal">Goal</Label>
              <Textarea
                id="edit-sprint-goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Sprint goal"
                rows={2}
              />
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as SprintStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Date Range *</Label>
              <div className="flex justify-center border rounded-md p-2">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={1}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateSprint.isPending}>
              {updateSprint.isPending ? "Updating..." : "Update Sprint"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
