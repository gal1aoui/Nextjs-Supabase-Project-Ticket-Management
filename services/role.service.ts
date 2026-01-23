import { handleSupabaseError } from "@/lib/errors";
import { createClient } from "@/lib/supabase/client";
import type { Role } from "@/types/database";

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
};
