import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
import DeleteDialog from "@/components/delete-alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateRole, useDeleteRole, useUpdateRole } from "@/stores/role.store";
import {
  AVAILABLE_PERMISSIONS,
  type Role,
  type RoleFormSchema,
  roleFormSchema,
} from "@/types/role";

interface RoleFormProps {
  projectId: string;
  role?: Role;
  closeModal: () => void;
}

export default function RoleForm({ projectId, role, closeModal }: Readonly<RoleFormProps>) {
  const [form, setForm] = useState<RoleFormSchema>({
    name: role?.name || "",
    description: role?.description || "",
    permissions: role?.permissions || [],
  });
  const [error, setError] = useState<string | undefined>(undefined);
  const [deletingRoleId, setDeletingRoleId] = useState<string | null>(null);

  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();

  const handleDelete = async (roleId: string) => {
    if (!deletingRoleId) return;

    try {
      await deleteRole.mutateAsync(roleId);
      closeModal();
      toast.success("Role deleted");
    } catch (_) {
      toast.error(`Failed to delete role: ${deleteRole.error?.message}`);
    }
  };

  const handlePermissionToggle = (permissionKey: string) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionKey)
        ? prev.permissions.filter((p) => p !== permissionKey)
        : [...prev.permissions, permissionKey],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = roleFormSchema.safeParse(form);
    if (!parsed.success) {
      const tree = z.treeifyError(parsed.error);
      setError(
        tree.properties?.name?.errors[0] ?? tree.properties?.permissions?.errors[0] ?? undefined
      );
      return;
    }

    try {
      if (role) {
        await updateRole.mutateAsync({
          id: role.id,
          name: form.name,
          description: form.description,
          permissions: form.permissions,
        });
      } else {
        await createRole.mutateAsync({
          name: form.name,
          description: form.description,
          permissions: form.permissions,
          project_id: projectId,
        });
      }
      closeModal();
      toast.success(`Role ${role ? "updated" : "created"} successfully`);
    } catch (_) {
      toast.error(
        `Failed to ${role ? "update" : "create"} role: ${role ? updateRole.error?.message : createRole.error?.message}`
      );
    }
  };

  const isSystem = role?.is_system ?? false;

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="role-name">Name</Label>
          <Input
            id="role-name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="e.g. Reviewer"
            disabled={isSystem}
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="role-description">Description</Label>
          <Textarea
            id="role-description"
            value={form.description ?? ""}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Describe this role's purpose"
            rows={2}
            disabled={isSystem}
          />
        </div>
        <div className="grid gap-2">
          <Label>Permissions</Label>
          <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto border rounded-md p-3">
            {AVAILABLE_PERMISSIONS.map((perm) => (
              <div
                key={perm.key}
                className="flex items-start gap-3 cursor-pointer hover:bg-muted/50 rounded p-1.5 -m-1.5"
              >
                <Checkbox
                  checked={form.permissions.includes(perm.key)}
                  onCheckedChange={() => handlePermissionToggle(perm.key)}
                  disabled={isSystem}
                  className="mt-0.5"
                />
                <div>
                  <span className="text-sm font-medium">{perm.label}</span>
                  <p className="text-xs text-muted-foreground">{perm.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <DialogFooter>
        {role && !isSystem && (
          <>
            <Button
              variant="destructive"
              onClick={(e: React.FormEvent) => {
                e.preventDefault();
                setDeletingRoleId(role.id);
              }}
            >
              Delete
            </Button>
            <DeleteDialog
              description="This action cannot be undone. This will permanently delete the custom role."
              openState={!!deletingRoleId}
              onOpenChange={(open) => !open && setDeletingRoleId(null)}
              deleteAction={() => handleDelete(role.id)}
            />
          </>
        )}
        {!isSystem && <Button type="submit">{role ? "Update" : "Create"}</Button>}
      </DialogFooter>
    </form>
  );
}
