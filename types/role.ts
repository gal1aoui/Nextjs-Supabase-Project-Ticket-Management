import { z } from "zod";

// ===========================================
// Available Permissions
// ===========================================

export const AVAILABLE_PERMISSIONS = [
  { key: "manage_project", label: "Manage Project", description: "Full project settings access" },
  { key: "manage_members", label: "Manage Members", description: "Invite/remove members, assign roles" },
  { key: "manage_roles", label: "Manage Roles", description: "Create/modify custom roles" },
  { key: "manage_tickets", label: "Manage Tickets", description: "Full ticket CRUD" },
  { key: "manage_states", label: "Manage States", description: "Create/modify ticket states" },
  { key: "manage_priorities", label: "Manage Priorities", description: "Create/modify priorities" },
  { key: "manage_events", label: "Manage Events", description: "Full event CRUD" },
  { key: "create_tickets", label: "Create Tickets", description: "Create new tickets" },
  { key: "update_own_tickets", label: "Update Own Tickets", description: "Update tickets created by self" },
  { key: "update_tickets", label: "Update Tickets", description: "Update any ticket" },
  { key: "comment", label: "Comment", description: "Add comments to tickets" },
  { key: "view_tickets", label: "View Tickets", description: "View-only ticket access" },
  { key: "view_reports", label: "View Reports", description: "Access to reports/analytics" },
] as const;

export type PermissionKey = (typeof AVAILABLE_PERMISSIONS)[number]["key"];

// ===========================================
// Database Types
// ===========================================

export type Role = {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
  is_system: boolean;
  project_id: string | null;
  created_by: string | null;
  created_at: string;
};

// ===========================================
// Form Schemas
// ===========================================

export const roleFormSchema = z.object({
  name: z.string().min(3, "Role name must be at least 3 characters").max(100),
  description: z.string().optional(),
  permissions: z.array(z.string()).min(1, "At least one permission is required"),
});

export type RoleFormSchema = z.infer<typeof roleFormSchema>;

const roleCreateSchema = z.object({
  project_id: z.uuid("Invalid project ID"),
});

const roleCreate = z.intersection(roleFormSchema, roleCreateSchema);
export type RoleCreate = z.infer<typeof roleCreate>;

export const roleUpdateSchema = z.object({
  id: z.uuid(),
});

const roleUpdate = z.intersection(roleFormSchema, roleUpdateSchema);
export type RoleUpdate = z.infer<typeof roleUpdate>;
