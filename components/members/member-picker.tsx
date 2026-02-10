"use client";

import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDebounce } from "@/hooks/use-debounce";
import { getUserInitials } from "@/lib/helpers";
import { useProfile, useSearchProfiles } from "@/stores/profile.store";
import { useProjectMembers } from "@/stores/project-member.store";

interface MemberPickerProps {
  projectId?: string;
  value: string[];
  onChange: (ids: string[]) => void;
  label?: string;
  placeholder?: string;
  excludeUserIds?: string[];
}

export function MemberPicker({
  projectId,
  value,
  onChange,
  label = "Members",
  placeholder = "Search by name or username...",
  excludeUserIds = [],
}: MemberPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Data sources
  const { data: members = [] } = useProjectMembers(projectId ?? "");
  const { data: globalResults = [] } = useSearchProfiles(projectId ? "" : debouncedSearch);

  // Compute candidate user IDs
  const candidateIds = useMemo(() => {
    const excluded = new Set([...value, ...excludeUserIds]);

    if (projectId) {
      return members
        .filter((m) => m.status === "active")
        .map((m) => m.user_id)
        .filter((id) => !excluded.has(id));
    }

    return globalResults.map((p) => p.id).filter((id) => !excluded.has(id));
  }, [projectId, members, globalResults, value, excludeUserIds]);

  const addUser = (userId: string) => {
    if (!value.includes(userId)) {
      onChange([...value, userId]);
    }
    setSearchQuery("");
  };

  const removeUser = (userId: string) => {
    onChange(value.filter((id) => id !== userId));
  };

  // Show results: for project mode show when input focused or has text,
  // for global mode show when search has results
  const showResults = projectId ? candidateIds.length > 0 : debouncedSearch.length >= 2;

  return (
    <div className="grid gap-2">
      {label && (
        <Label>
          {label} ({value.length} selected)
        </Label>
      )}

      {/* Selected users as chips */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-2 border rounded-md bg-muted/30">
          {value.map((userId) => (
            <SelectedChip key={userId} userId={userId} onRemove={() => removeUser(userId)} />
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Results list */}
      {showResults && (
        <div className="max-h-48 overflow-y-auto border rounded-md">
          {candidateIds.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No users found</div>
          ) : (
            candidateIds.map((userId) => (
              <SearchResultItem
                key={userId}
                userId={userId}
                searchQuery={projectId ? searchQuery : ""}
                onClick={() => addUser(userId)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function SelectedChip({ userId, onRemove }: { userId: string; onRemove: () => void }) {
  const { data: profile } = useProfile(userId);

  return (
    <Badge variant="secondary" className="flex items-center gap-1.5 pr-1 py-1">
      <Avatar className="h-4 w-4">
        <AvatarImage src={profile?.avatar_url || undefined} />
        <AvatarFallback className="text-[8px]">
          {getUserInitials(profile?.full_name ?? null)}
        </AvatarFallback>
      </Avatar>
      <span className="text-xs">{profile?.full_name || "Loading..."}</span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="ml-0.5 rounded-full hover:bg-muted p-0.5"
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );
}

function SearchResultItem({
  userId,
  searchQuery,
  onClick,
}: {
  userId: string;
  searchQuery: string;
  onClick: () => void;
}) {
  const { data: profile } = useProfile(userId);

  // Client-side filtering for project mode
  if (searchQuery && profile) {
    const q = searchQuery.toLowerCase();
    const nameMatch = profile.full_name?.toLowerCase().includes(q);
    const usernameMatch = profile.username?.toLowerCase().includes(q);
    if (!nameMatch && !usernameMatch) return null;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 hover:bg-accent transition-colors"
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={profile?.avatar_url || undefined} />
        <AvatarFallback className="text-xs">
          {getUserInitials(profile?.full_name ?? null)}
        </AvatarFallback>
      </Avatar>
      <div className="text-left">
        <div className="font-medium text-sm">{profile?.full_name || "Loading..."}</div>
        {profile?.username && (
          <div className="text-xs text-muted-foreground">@{profile.username}</div>
        )}
      </div>
    </button>
  );
}
