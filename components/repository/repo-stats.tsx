"use client";

import { GitBranch, GitCommitHorizontal, GitFork, Star, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserInitials } from "@/lib/helpers";
import { useRepoStats } from "@/stores/repository.store";

interface RepoStatsProps {
  projectId: string;
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Java: "#b07219",
  Go: "#00ADD8",
  Rust: "#dea584",
  Ruby: "#701516",
  PHP: "#4F5D95",
  CSS: "#563d7c",
  HTML: "#e34c26",
  Shell: "#89e051",
  C: "#555555",
  "C++": "#f34b7d",
  "C#": "#178600",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  Vue: "#41b883",
  SCSS: "#c6538c",
  Dockerfile: "#384d54",
};

function getLanguageColor(language: string): string {
  return LANGUAGE_COLORS[language] || "#8b8b8b";
}

export function RepoStats({ projectId }: RepoStatsProps) {
  const { data: stats, isLoading } = useRepoStats(projectId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-6 rounded-full" />
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    { label: "Commits", value: stats.total_commits, icon: GitCommitHorizontal },
    { label: "Branches", value: stats.total_branches, icon: GitBranch },
    { label: "Stars", value: stats.stars, icon: Star },
    { label: "Forks", value: stats.forks, icon: GitFork },
  ];

  const languages = Object.entries(stats.languages).sort(([, a], [, b]) => b - a);

  return (
    <div className="space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
            <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-lg font-semibold leading-none">{value.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Languages bar */}
      {languages.length > 0 && (
        <div className="space-y-2">
          <div className="flex h-2.5 rounded-full overflow-hidden">
            {languages.map(([lang, pct]) => (
              <div
                key={lang}
                className="h-full first:rounded-l-full last:rounded-r-full"
                style={{
                  width: `${pct}%`,
                  backgroundColor: getLanguageColor(lang),
                  minWidth: pct > 0 ? "3px" : 0,
                }}
                title={`${lang}: ${pct}%`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {languages.slice(0, 6).map(([lang, pct]) => (
              <div key={lang} className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: getLanguageColor(lang) }}
                />
                <span className="text-xs">
                  {lang} <span className="text-muted-foreground">{pct}%</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top contributors */}
      {stats.top_contributors.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>Top Contributors</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {stats.top_contributors.map((contributor) => (
              <div
                key={contributor.name}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-muted/30 text-sm"
              >
                <Avatar className="h-5 w-5">
                  {contributor.avatar_url && <AvatarImage src={contributor.avatar_url} />}
                  <AvatarFallback className="text-[8px]">
                    {getUserInitials(contributor.name)}
                  </AvatarFallback>
                </Avatar>
                <span>{contributor.name}</span>
                <span className="text-muted-foreground text-xs">
                  {contributor.commits.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
