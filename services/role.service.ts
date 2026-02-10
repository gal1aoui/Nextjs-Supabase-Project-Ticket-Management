import { handleSupabaseError, requireAuth } from "@/lib/errors";
import { createClient } from "@/lib/supabase/client";
import type { Role, RoleCreate, RoleUpdate } from "@/types/role";

export const roleService = {
  async getAll(): Promise<Role[]> {
    const supabase = createClient();

    return handleSupabaseError(() =>
      supabase.from("roles").select("*").order("name", { ascending: true })
    );
  },

  async getById(id: string): Promise<Role> {
    const supabase = createClient();

    return handleSupabaseError(() => supabase.from("roles").select("*").eq("id", id).single());
  },

  async getByProject(projectId: string): Promise<Role[]> {
    const supabase = createClient();

    return handleSupabaseError(() =>
      supabase
        .from("roles")
        .select("*")
        .or(`is_system.eq.true,project_id.eq.${projectId}`)
        .order("is_system", { ascending: false })
        .order("name", { ascending: true })
    );
  },

  async create(role: RoleCreate): Promise<Role> {
    const supabase = createClient();
    const userId = await requireAuth(supabase);

    return handleSupabaseError(() =>
      supabase
        .from("roles")
        .insert({
          name: role.name,
          description: role.description,
          permissions: role.permissions,
          project_id: role.project_id,
          created_by: userId,
          is_system: false,
        })
        .select()
        .single()
    );
  },

  async update(role: RoleUpdate): Promise<Role> {
    const supabase = createClient();
    const { id, ...updates } = role;

    return handleSupabaseError(() =>
      supabase.from("roles").update(updates).eq("id", id).eq("is_system", false).select().single()
    );
  },

  async delete(id: string): Promise<void> {
    const supabase = createClient();

    await handleSupabaseError(() =>
      supabase.from("roles").delete().eq("id", id).eq("is_system", false).select()
    );
  },
};
