import { createClient } from "@/lib/supabase/client";
import type { ProjectMember, ProjectMembersData } from "@/types/database";
import type { ProjectMemberInvite, ProjectMemberUpdate } from "@/types/project-member";

export const projectMemberService = {
  async getByProject(projectId: string): Promise<ProjectMembersData[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("project_members")
      .select(`user_id, status, role_id, invited_at`)
      .eq("project_id", projectId);
    if (error) throw error;
    return data as ProjectMembersData[];
  },

  async invite(invite: ProjectMemberInvite): Promise<ProjectMember> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("project_members")
      .insert({ ...invite, invited_by: user.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(update: ProjectMemberUpdate): Promise<ProjectMember> {
    const supabase = createClient();
    const { id, ...updates } = update;

    const { data, error } = await supabase
      .from("project_members")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async remove(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("project_members").delete().eq("id", id);

    if (error) throw error;
  },

  async acceptInvite(memberId: string): Promise<ProjectMember> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("project_members")
      .update({
        status: "active",
        joined_at: new Date().toISOString(),
      })
      .eq("id", memberId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
