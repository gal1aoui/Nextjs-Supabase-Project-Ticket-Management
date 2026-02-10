"use client";

import { useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { useCreateSprint, useUpdateSprint } from "@/stores/sprint.store";
import type { Sprint, SprintStatus } from "@/types/sprint";

interface SprintFormProps {
  projectId: string;
  sprint?: Sprint;
  closeModal: () => void;
}

export default function SprintForm({ projectId, sprint, closeModal }: Readonly<SprintFormProps>) {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [status, setStatus] = useState<SprintStatus>("planning");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const createSprint = useCreateSprint();
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
    } else {
      setName("");
      setGoal("");
      setStatus("planning");
      setDateRange(undefined);
    }
  }, [sprint]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !dateRange?.from || !dateRange?.to) {
      toast.error("Please fill in the sprint name and date range");
      return;
    }

    try {
      if (sprint) {
        await updateSprint.mutateAsync({
          id: sprint.id,
          name,
          goal: goal || undefined,
          status,
          start_date: dateRange.from.toISOString().split("T")[0],
          end_date: dateRange.to.toISOString().split("T")[0],
        });
      } else {
        await createSprint.mutateAsync({
          name,
          goal: goal || undefined,
          project_id: projectId,
          start_date: dateRange.from.toISOString().split("T")[0],
          end_date: dateRange.to.toISOString().split("T")[0],
          status,
        });
      }
      closeModal();
      toast.success(`Sprint ${sprint ? "updated" : "created"} successfully`);
    } catch (_) {
      toast.error(
        `Failed to ${sprint ? "update" : "create"} sprint: ${sprint ? updateSprint.error?.message : createSprint.error?.message}`
      );
    }
  };

  return (
    <form onSubmit={handleSubmit}>
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
        {sprint && (
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
        )}
        <div className="grid gap-2">
          <Label>Date Range *</Label>
          <div className="flex justify-center border rounded-md p-2">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={1}
              disabled={!sprint ? { before: new Date() } : undefined}
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
        <Button type="submit" disabled={createSprint.isPending || updateSprint.isPending}>
          {createSprint.isPending || updateSprint.isPending
            ? sprint
              ? "Updating..."
              : "Creating..."
            : sprint
              ? "Update Sprint"
              : "Create Sprint"}
        </Button>
      </DialogFooter>
    </form>
  );
}
