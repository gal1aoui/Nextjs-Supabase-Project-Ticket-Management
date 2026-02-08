import { handleSupabaseError, requireAuth } from "@/lib/errors";
import { createClient } from "@/lib/supabase/client";
import type { ProjectMember, ProjectMemberInvite, ProjectMemberUpdate } from "@/types/project-member";

interface ProjectMembersData {
  user_id: string;
  status: string;
  role_id: string;
  invited_at: string;
}

export interface ProjectInvitesData {
  project_id: string;
  user_id: string;
  role_id: string;
  invited_by: string;
  invited_at: string;
}

export const projectMemberService = {
  async getByProject(projectId: string): Promise<ProjectMembersData[]> {
    const supabase = createClient();

    return handleSupabaseError(() =>
      supabase
        .from("project_members")
        .select("user_id, status, role_id, invited_at")
        .eq("project_id", projectId)
    ) as Promise<ProjectMembersData[]>;
  },

  async invite(invite: ProjectMemberInvite): Promise<ProjectMember> {
    const supabase = createClient();
    const userId = await requireAuth(supabase);

    return handleSupabaseError(() =>
      supabase
        .from("project_members")
        .insert({ ...invite, invited_by: userId })
        .select()
        .single()
    );
  },

  async update(update: ProjectMemberUpdate): Promise<ProjectMember> {
    const supabase = createClient();
    const { id, ...updates } = update;

    return handleSupabaseError(() =>
      supabase.from("project_members").update(updates).eq("id", id).select().single()
    );
  },

  async remove(id: string): Promise<void> {
    const supabase = createClient();

    await handleSupabaseError(() =>
      supabase.from("project_members").delete().eq("id", id).select()
    );
  },

  async acceptInvite(memberId: string): Promise<ProjectMember> {
    const supabase = createClient();

    return handleSupabaseError(() =>
      supabase
        .from("project_members")
        .update({
          status: "active",
          joined_at: new Date().toISOString(),
        })
        .eq("id", memberId)
        .select()
        .single()
    );
  },

  async declineInvite(memberId: string): Promise<void> {
    const supabase = createClient();

    await handleSupabaseError(() =>
      supabase.from("project_members").delete().eq("id", memberId).select()
    );
  },

  async getPendingInvitations(): Promise<ProjectMember[]> {
    const supabase = createClient();
    const userId = await requireAuth(supabase);

    return handleSupabaseError(() =>
      supabase
        .from("project_members")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "pending")
        .order("invited_at", { ascending: false })
    );
  },
};
