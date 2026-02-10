"use client";

import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDebounce } from "@/hooks/use-debounce";
import { getUserInitials } from "@/lib/helpers";
import { useProfile } from "@/stores/profile.store";
import { useProjectMembers } from "@/stores/project-member.store";

interface SingleMemberPickerProps {
  projectId: string;
  value: string | null;
  onChange: (id: string | null) => void;
  label?: string;
  placeholder?: string;
  excludeUserIds?: string[];
}

export function SingleMemberPicker({
  projectId,
  value,
  onChange,
  label = "Assignee",
  placeholder = "Search members...",
  excludeUserIds = [],
}: SingleMemberPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: members = [] } = useProjectMembers(projectId);

  const candidateIds = useMemo(() => {
    const excluded = new Set([...excludeUserIds, ...(value ? [value] : [])]);
    return members
      .filter((m) => m.status === "active")
      .map((m) => m.user_id)
      .filter((id) => !excluded.has(id));
  }, [members, value, excludeUserIds]);

  const selectUser = (userId: string) => {
    onChange(userId);
    setSearchQuery("");
    setIsFocused(false);
  };

  const clearSelection = () => {
    onChange(null);
  };

  const showResults = isFocused && candidateIds.length > 0;

  return (
    <div className="grid gap-2">
      {label && <Label>{label}</Label>}

      {/* Selected user display */}
      {value ? (
        <SelectedUser userId={value} onClear={clearSelection} />
      ) : (
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            value={debouncedSearch}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            className="pl-9"
          />

          {showResults && (
            <div className="absolute z-50 top-full mt-1 w-full max-h-48 overflow-y-auto border rounded-md bg-popover shadow-md">
              {candidateIds.map((userId) => (
                <SearchResult
                  key={userId}
                  userId={userId}
                  debouncedSearch={debouncedSearch}
                  onClick={() => selectUser(userId)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SelectedUser({ userId, onClear }: { userId: string; onClear: () => void }) {
  const { data: profile } = useProfile(userId);

  return (
    <div className="flex items-center gap-3 p-2 border rounded-md bg-muted/30">
      <Avatar className="h-7 w-7">
        <AvatarImage src={profile?.avatar_url || undefined} />
        <AvatarFallback className="text-xs">
          {getUserInitials(profile?.full_name ?? null)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{profile?.full_name || "Loading..."}</div>
        {profile?.username && (
          <div className="text-xs text-muted-foreground">@{profile.username}</div>
        )}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0"
        onClick={onClear}
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

function SearchResult({
  userId,
  debouncedSearch,
  onClick,
}: {
  userId: string;
  debouncedSearch: string;
  onClick: () => void;
}) {
  const { data: profile } = useProfile(userId);

  if (debouncedSearch && profile) {
    const q = debouncedSearch.toLowerCase();
    const nameMatch = profile.full_name?.toLowerCase().includes(q);
    const usernameMatch = profile.username?.toLowerCase().includes(q);
    if (!nameMatch && !usernameMatch) return null;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 p-2.5 hover:bg-accent transition-colors"
    >
      <Avatar className="h-7 w-7">
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
