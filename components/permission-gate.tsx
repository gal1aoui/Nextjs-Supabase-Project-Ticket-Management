"use client";

import type { ReactNode } from "react";
import { useProjectPermissions } from "@/hooks/use-project-permissions";

interface PermissionGateProps {
  projectId: string;
  permission: string | string[];
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGate({
  projectId,
  permission,
  fallback = null,
  children,
}: PermissionGateProps) {
  const { hasPermission, isLoading } = useProjectPermissions(projectId);

  if (isLoading) return null;

  const allowed = Array.isArray(permission)
    ? permission.some((p) => hasPermission(p))
    : hasPermission(permission);

  return allowed ? <>{children}</> : <>{fallback}</>;
}
