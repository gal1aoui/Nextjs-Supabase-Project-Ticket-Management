import { handleSupabaseError, requireAuth } from "@/lib/errors";
import { supabaseClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";
import type { ProfileUpdate } from "@/types/profile";

export const profileService = {
  async getById(id: string): Promise<Profile> {
    return handleSupabaseError(() =>
      supabaseClient.from("profiles").select("*").eq("id", id).single()
    );
  },

  async getCurrent(): Promise<Profile> {
    const userId = await requireAuth(supabaseClient);

    return handleSupabaseError(() =>
      supabaseClient.from("profiles").select("*").eq("id", userId).single()
    );
  },

  async signOut() {
    const { error } = await supabaseClient.auth.signOut();
    return { error };
  },

  async update(updates: ProfileUpdate): Promise<Profile> {
    const userId = await requireAuth(supabaseClient);

    return handleSupabaseError(() =>
      supabaseClient
        .from("profiles")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", userId)
        .select()
        .single()
    );
  },

  async search(query: string): Promise<Profile[]> {
    return handleSupabaseError(() =>
      supabaseClient
        .from("profiles")
        .select("*")
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .limit(10)
    );
  },
};
