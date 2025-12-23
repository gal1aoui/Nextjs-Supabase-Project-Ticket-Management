import { Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useDeleteTicketState } from "@/stores/ticket-state.store";
import type { TicketState } from "@/types/database";

interface StateItemProps {
  state: TicketState;
  onEdit: () => void;
}

export default function StateItem({ state, onEdit }: Readonly<StateItemProps>) {
  const deleteState = useDeleteTicketState();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this state?")) return;
    try {
      await deleteState.mutateAsync(state.id);
      toast.success("State deleted");
    } catch (_) {
      toast.error(`Failed to delete state: ${deleteState.error?.message}`);
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
