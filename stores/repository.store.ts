import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { repositoryService } from "@/services/repository.service";
import type { RepositoryConnect } from "@/types/repository";

export const repoKeys = {
  byProject: (projectId: string) => ["repository", projectId] as const,
  commits: (projectId: string, branch?: string) =>
    ["repository", "commits", projectId, branch] as const,
  branches: (projectId: string) => ["repository", "branches", projectId] as const,
  stats: (projectId: string) => ["repository", "stats", projectId] as const,
};

export function useRepository(projectId: string) {
  return useQuery({
    queryKey: repoKeys.byProject(projectId),
    queryFn: () => repositoryService.getByProject(projectId),
    enabled: !!projectId,
  });
}

export function useCommits(projectId: string, branch?: string, page = 1) {
  return useQuery({
    queryKey: [...repoKeys.commits(projectId, branch), page],
    queryFn: () => repositoryService.getCommits(projectId, branch, page),
    enabled: !!projectId,
  });
}

export function useRepoStats(projectId: string) {
  return useQuery({
    queryKey: repoKeys.stats(projectId),
    queryFn: () => repositoryService.getStats(projectId),
    enabled: !!projectId,
  });
}

export function useBranches(projectId: string) {
  return useQuery({
    queryKey: repoKeys.branches(projectId),
    queryFn: () => repositoryService.getBranches(projectId),
    enabled: !!projectId,
  });
}

export function useConnectRepo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: RepositoryConnect) => repositoryService.connect(data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: repoKeys.byProject(variables.project_id) });
    },
  });
}

export function useDisconnectRepo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) => repositoryService.disconnect(projectId),
    onSuccess: (_, projectId) => {
      qc.invalidateQueries({ queryKey: repoKeys.byProject(projectId) });
      qc.invalidateQueries({ queryKey: ["repository"] });
    },
  });
}
