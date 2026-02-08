"use client";

import { Shield, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Role } from "@/types/role";

interface RoleItemProps {
  role: Role;
  onEdit: () => void;
}

export default function RoleItem({ role, onEdit }: Readonly<RoleItemProps>) {
  return (
    <button
      className="w-full flex items-center justify-between p-4 rounded-lg border cursor-pointer"
      onClick={onEdit}
      type="button"
    >
      <div className="flex items-center gap-2">
        {role.is_system ? (
          <ShieldCheck className="h-4 w-4 text-primary" />
        ) : (
          <Shield className="h-4 w-4 text-muted-foreground" />
        )}
        <span className="font-medium">{role.name}</span>
        {role.is_system && (
          <Badge variant="secondary" className="text-[10px]">
            System
          </Badge>
        )}
      </div>
      <span className="text-xs text-muted-foreground">
        {role.permissions.length} permission{role.permissions.length !== 1 ? "s" : ""}
      </span>
    </button>
  );
}
