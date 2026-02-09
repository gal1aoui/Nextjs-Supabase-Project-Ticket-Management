"use client";

import { ExternalLink, Github, GitBranch as GitBranchIcon, GitCommitHorizontal, Unlink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PermissionGate } from "@/components/permission-gate";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDisconnectRepo, useRepository } from "@/stores/repository.store";
import { BranchList } from "./branch-list";
import { CommitHistory } from "./commit-history";
import { RepoConnectForm } from "./repo-connect-form";

interface RepoOverviewProps {
  projectId: string;
}

export function RepoOverview({ projectId }: RepoOverviewProps) {
  const { data: repo, isLoading } = useRepository(projectId);
  const disconnectRepo = useDisconnectRepo();
  const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false);

  const handleDisconnect = async () => {
    try {
      await disconnectRepo.mutateAsync(projectId);
      setDisconnectDialogOpen(false);
      toast.success("Repository disconnected");
    } catch (_) {
      toast.error("Failed to disconnect repository");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!repo) {
    return (
      <PermissionGate
        projectId={projectId}
        permission="manage_project"
        fallback={
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No repository connected</p>
            <p className="text-xs mt-1">Ask a project manager to connect a repository</p>
          </div>
        }
      >
        <RepoConnectForm projectId={projectId} />
      </PermissionGate>
    );
  }

  const ProviderIcon = repo.provider === "github" ? Github : GitLabIcon;

  return (
    <div className="space-y-4">
      {/* Repo info header */}
      <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
        <div className="flex items-center gap-3">
          <ProviderIcon className="h-5 w-5" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {repo.repo_owner}/{repo.repo_name}
              </span>
              <Badge variant="outline" className="text-xs">
                {repo.provider}
              </Badge>
            </div>
            <a
              href={repo.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              {repo.repo_url}
            </a>
          </div>
        </div>

        <PermissionGate projectId={projectId} permission="manage_project">
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setDisconnectDialogOpen(true)}
          >
            <Unlink className="h-3.5 w-3.5 mr-1.5" />
            Disconnect
          </Button>
        </PermissionGate>
      </div>

      {/* Commits & Branches tabs */}
      <Tabs defaultValue="commits" className="space-y-4">
        <TabsList>
          <TabsTrigger value="commits">
            <GitCommitHorizontal className="h-4 w-4 mr-2" />
            Commits
          </TabsTrigger>
          <TabsTrigger value="branches">
            <GitBranchIcon className="h-4 w-4 mr-2" />
            Branches
          </TabsTrigger>
        </TabsList>

        <TabsContent value="commits">
          <CommitHistory
            projectId={projectId}
            repoUrl={repo.repo_url}
            provider={repo.provider}
          />
        </TabsContent>

        <TabsContent value="branches">
          <BranchList
            projectId={projectId}
            repoUrl={repo.repo_url}
            provider={repo.provider}
          />
        </TabsContent>
      </Tabs>

      {/* Disconnect confirmation */}
      <AlertDialog open={disconnectDialogOpen} onOpenChange={setDisconnectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect Repository</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to disconnect this repository? You can reconnect it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisconnect}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function GitLabIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51L23 13.45a.84.84 0 0 1-.35.94z" />
    </svg>
  );
}
