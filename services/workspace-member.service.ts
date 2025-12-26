import { createClient } from "@/lib/supabase/client";
import type { WorkspaceMember, WorkspaceMemberWithProfile } from "@/types/database";
import type { WorkspaceMemberInvite } from "@/types/workspace-member";

export const workspaceMemberService = {
  async getByWorkspace(workspaceId: string): Promise<WorkspaceMemberWithProfile[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("workspace_members")
      .select(`
        *,
        profile:profiles(*),
        role:roles(*)
      `)
      .eq("workspace_id", workspaceId)
      .order("joined_at", { ascending: true });

    if (error) throw error;
    return data as WorkspaceMemberWithProfile[];
  },

  async invite(invite: WorkspaceMemberInvite): Promise<WorkspaceMember> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("workspace_members")
      .insert({ ...invite, invited_by: user.id })
      .select()
      .single();

    if (error) throw error;
    return data as WorkspaceMember;
  },
};
