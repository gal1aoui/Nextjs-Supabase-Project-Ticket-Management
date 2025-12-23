import { createClient } from "@/lib/supabase/client";
import type { Role } from "@/types/database";

export const roleService = {
  async getAll(): Promise<Role[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("roles")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    return data;
  },

  async getById(id: string): Promise<Role> {
    const supabase = createClient();
    const { data, error } = await supabase.from("roles").select("*").eq("id", id).single();

    if (error) throw error;
    return data;
  },
};
