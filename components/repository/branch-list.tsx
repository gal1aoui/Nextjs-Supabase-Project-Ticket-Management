"use client";

import { ExternalLink, GitBranch, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBranches } from "@/stores/repository.store";

interface BranchListProps {
  projectId: string;
  repoUrl: string;
  provider: string;
}

export function BranchList({ projectId, repoUrl, provider }: BranchListProps) {
  const { data: branches = [], isLoading } = useBranches(projectId);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-14" />
        ))}
      </div>
    );
  }

  if (branches.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">No branches found</p>
    );
  }

  // Sort: default first, then alphabetical
  const sorted = [...branches].sort((a, b) => {
    if (a.is_default) return -1;
    if (b.is_default) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-1">
      {sorted.map((branch) => {
        const branchUrl =
          provider === "github"
            ? `${repoUrl}/tree/${branch.name}`
            : `${repoUrl}/-/tree/${branch.name}`;

        return (
          <div
            key={branch.name}
            className="flex items-center justify-between p-3 rounded-md border hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <GitBranch className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium font-mono truncate">{branch.name}</span>
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
                <span className="text-xs text-muted-foreground font-mono">
                  {branch.commit_sha.slice(0, 7)}
                </span>
              </div>
            </div>

            <a
              href={branchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        );
      })}
    </div>
  );
}
