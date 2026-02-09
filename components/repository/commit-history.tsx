"use client";

import { GitCommitHorizontal, GitMerge } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserInitials } from "@/lib/helpers";
import { useBranches, useCommits } from "@/stores/repository.store";
import type { GitCommit } from "@/types/repository";

interface CommitHistoryProps {
  projectId: string;
  repoUrl: string;
  provider: string;
}

export function CommitHistory({ projectId, repoUrl, provider }: CommitHistoryProps) {
  const [selectedBranch, setSelectedBranch] = useState<string | undefined>();
  const [page, setPage] = useState(1);

  const { data: branches = [], isLoading: branchesLoading } = useBranches(projectId);
  const { data: commits = [], isLoading: commitsLoading } = useCommits(
    projectId,
    selectedBranch,
    page
  );

  const defaultBranch = branches.find((b) => b.is_default);

  return (
    <div className="space-y-4">
      {/* Branch selector */}
      <div className="flex items-center gap-3">
        <Select
          value={selectedBranch || defaultBranch?.name || ""}
          onValueChange={(v) => { setSelectedBranch(v); setPage(1); }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder={branchesLoading ? "Loading..." : "Select branch"} />
          </SelectTrigger>
          <SelectContent>
            {branches.map((branch) => (
              <SelectItem key={branch.name} value={branch.name}>
                <div className="flex items-center gap-2">
                  {branch.name}
                  {branch.is_default && (
                    <Badge variant="outline" className="text-[10px] px-1 py-0">
                      default
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Commit list with graph */}
      {commitsLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
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
        <p className="text-sm text-muted-foreground text-center py-8">No commits found</p>
      ) : (
        <div className="relative">
          {/* Vertical line */}
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
      )}

      {/* Pagination */}
      {commits.length >= 30 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}

function CommitNode({
  commit,
  repoUrl,
  provider,
  isLast,
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
    provider === "github"
      ? `${repoUrl}/commit/${commit.sha}`
      : `${repoUrl}/-/commit/${commit.sha}`;

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

          <a
            href={commitUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
          >
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
          <span className="text-xs text-muted-foreground">
            {commit.author.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {timeAgo}
          </span>
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
