import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { projectMemberService } from "@/services/project-member.service";
import type { ProjectMemberInvite, ProjectMemberUpdate } from "@/types/project-member";
import { useRouter } from "next/navigation";

export const projectMemberKeys = {
  byProject: (projectId: string) => ["project-members", projectId] as const,
};



export function useProjectMembers(projectId: string) {
  return useQuery({
    queryKey: projectMemberKeys.byProject(projectId),
    queryFn: () => projectMemberService.getByProject(projectId),
    enabled: !!projectId,
  });
}

export function useInviteMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ProjectMemberInvite) => projectMemberService.invite(data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: projectMemberKeys.byProject(variables.project_id) });
    },
  });
}

export function useUpdateMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ProjectMemberUpdate) => projectMemberService.update(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project-members"] });
    },
  });
}

export function useAcceptMemberInvitation(projectId: string) {
  const router = useRouter();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => projectMemberService.acceptInvite(memberId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project-members"] });
      qc.invalidateQueries({ queryKey: ['projects'] });
      router.push(`/projects/${projectId}`)
    },
  });
}

export function useDeclineMemberInvitation() {
  const router = useRouter();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => projectMemberService.declineInvite(memberId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project-members"] });
      router.push('/projects')
    },
  });
}

export function useRemoveMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectMemberService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project-members"] });
    },
  });
}

export function usePendingInvitations() {
  return useQuery({
    queryKey: ["project-members", "pending"],
    queryFn: () => projectMemberService.getPendingInvitations(),
  });
}
