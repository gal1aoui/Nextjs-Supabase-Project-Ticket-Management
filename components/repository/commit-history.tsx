"use client";

import {
  ChevronRight,
  GitBranch as GitBranchIcon,
  GitCommitHorizontal,
  GitMerge,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserInitials } from "@/lib/helpers";
import { useBranches, useCommits } from "@/stores/repository.store";
import type { GitBranch, GitCommit } from "@/types/repository";

interface CommitHistoryProps {
  projectId: string;
  repoUrl: string;
  provider: string;
}

export function CommitHistory({ projectId, repoUrl, provider }: CommitHistoryProps) {
  const { data: branches = [], isLoading: branchesLoading } = useBranches(projectId);

  if (branchesLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  if (branches.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No branches found</p>;
  }

  // Sort: default first, then alphabetical
  const sorted = [...branches].sort((a, b) => {
    if (a.is_default) return -1;
    if (b.is_default) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-2">
      {sorted.map((branch) => (
        <BranchSection
          key={branch.name}
          branch={branch}
          projectId={projectId}
          repoUrl={repoUrl}
          provider={provider}
          defaultOpen={branch.is_default}
        />
      ))}
    </div>
  );
}

function BranchSection({
  branch,
  projectId,
  repoUrl,
  provider,
  defaultOpen,
}: {
  branch: GitBranch;
  projectId: string;
  repoUrl: string;
  provider: string;
  defaultOpen: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [page, setPage] = useState(1);

  const { data: commits = [], isLoading } = useCommits(
    projectId,
    branch.name,
    page
  );

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex items-center justify-between w-full p-3 rounded-lg border bg-muted/30 hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <ChevronRight
              className={`h-4 w-4 text-muted-foreground transition-transform ${
                isOpen ? "rotate-90" : ""
              }`}
            />
            <GitBranchIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium font-mono">{branch.name}</span>
            {branch.is_default && (
              <Badge variant="default" className="text-[10px] px-1.5 py-0">
                default
              </Badge>
            )}
            {branch.is_protected && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                <Shield className="h-2.5 w-2.5 mr-0.5" />
                protected
              </Badge>
            )}
          </div>
          {commits.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {commits.length}{commits.length >= 30 ? "+" : ""} commits
            </span>
          )}
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="ml-4 mt-1 pl-4 border-l-2 border-border">
          {isLoading ? (
            <div className="space-y-3 py-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-6 w-6 rounded-full shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : commits.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No commits found</p>
          ) : (
            <>
              <div className="relative">
                <div className="absolute left-3 top-3 bottom-3 w-px bg-border" />
                <div className="space-y-0">
                  {commits.map((commit, idx) => (
                    <CommitNode
                      key={commit.sha}
                      commit={commit}
                      repoUrl={repoUrl}
                      provider={provider}
                      isLast={idx === commits.length - 1}
                    />
                  ))}
                </div>
              </div>

              {commits.length >= 30 && (
                <div className="flex justify-center gap-2 py-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPage((p) => p - 1);
                    }}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPage((p) => p + 1);
                    }}
                  >
                    Load More
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function CommitNode({
  commit,
  repoUrl,
  provider,
}: {
  commit: GitCommit;
  repoUrl: string;
  provider: string;
  isLast: boolean;
}) {
  const isMerge = commit.parents.length > 1;
  const [firstLine, ...rest] = commit.message.split("\n");
  const hasBody = rest.filter((l) => l.trim()).length > 0;
  const [expanded, setExpanded] = useState(false);

  const commitUrl =
    provider === "github" ? `${repoUrl}/commit/${commit.sha}` : `${repoUrl}/-/commit/${commit.sha}`;

  const timeAgo = getRelativeTime(commit.author.date);

  return (
    <div className="flex gap-3 pl-0 py-2 relative">
      {/* Node dot */}
      <div className="relative z-10 shrink-0 flex items-start pt-0.5">
        <div
          className={`h-6 w-6 rounded-full flex items-center justify-center ${
            isMerge
              ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
              : "bg-background border-2 border-primary"
          }`}
        >
          {isMerge ? (
            <GitMerge className="h-3 w-3" />
          ) : (
            <GitCommitHorizontal className="h-3 w-3 text-primary" />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium leading-snug">
              {firstLine}
              {hasBody && !expanded && (
                <button
                  type="button"
                  onClick={() => setExpanded(true)}
                  className="text-muted-foreground hover:text-foreground ml-1 text-xs"
                >
                  ...more
                </button>
              )}
            </p>
            {expanded && rest.length > 0 && (
              <pre className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap font-sans">
                {rest.join("\n").trim()}
              </pre>
            )}
          </div>

          <a href={commitUrl} target="_blank" rel="noopener noreferrer" className="shrink-0">
            <Badge variant="outline" className="font-mono text-[10px] hover:bg-accent">
              {commit.sha.slice(0, 7)}
            </Badge>
          </a>
        </div>

        <div className="flex items-center gap-2 mt-1">
          {commit.author.avatar_url && (
            <Avatar className="h-4 w-4">
              <AvatarImage src={commit.author.avatar_url} />
              <AvatarFallback className="text-[8px]">
                {getUserInitials(commit.author.name)}
              </AvatarFallback>
            </Avatar>
          )}
          <span className="text-xs text-muted-foreground">{commit.author.name}</span>
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
          {isMerge && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              merge
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

function getRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
