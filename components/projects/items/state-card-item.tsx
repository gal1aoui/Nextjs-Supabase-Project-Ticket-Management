"use client";

import type { TicketState } from "@/types/database";

interface StateItemProps {
  state: TicketState;
  onEdit: () => void;
}

export default function StateItem({ state, onEdit }: Readonly<StateItemProps>) {
  return (
    <button
      className="w-full flex items-center justify-between p-4 rounded-lg border cursor-pointer"
      onClick={onEdit}
      type="button"
    >
      <div className="flex items-center gap-2">
        {state.color && (
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: state.color }} />
        )}
        <span className="font-medium">{state.name}</span>
      </div>
    </button>
  );
}
