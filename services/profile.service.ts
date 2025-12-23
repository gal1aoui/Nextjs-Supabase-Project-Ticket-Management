import { supabaseClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";
import type { ProfileUpdate } from "@/types/profile";

export const profileService = {
  async getById(id: string): Promise<Profile> {
    const { data, error } = await supabaseClient.from("profiles").select("*").eq("id", id).single();

    if (error) throw error;
    return data;
  },

  async getCurrent(): Promise<Profile> {
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabaseClient.auth.signOut();

    return { error };
  },

  async update(updates: ProfileUpdate): Promise<Profile> {
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabaseClient
      .from("profiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async search(query: string): Promise<Profile[]> {
    const { data, error } = await supabaseClient
      .from("profiles")
      .select("*")
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
      .limit(10);

    if (error) throw error;
    return data;
  },
};
