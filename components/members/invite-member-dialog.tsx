"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";
import { getUserInitials } from "@/lib/helpers";
import { useSearchProfiles } from "@/stores/profile.store";
import { useInviteMember } from "@/stores/project-member.store";
import { useRoles } from "@/stores/role.store";
import type { Profile } from "@/types/profile";

interface InviteMemberDialogProps {
  projectId: string;
  closeModal: () => void;
}

export function InviteMemberDialog({ projectId, closeModal }: InviteMemberDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [roleId, setRoleId] = useState("");

  const debouncedSearch = useDebounce(searchQuery, 500);

  const { data: roles = [] } = useRoles();
  const { data: searchResults = [] } = useSearchProfiles(debouncedSearch);

  const inviteMember = useInviteMember();

  const handleInvite = async () => {
    if (!selectedUser || !roleId) {
      toast.error("Please select a user and role");
      return;
    }

    try {
      await inviteMember.mutateAsync({
        project_id: projectId,
        user_id: selectedUser.id,
        role_id: roleId,
      });

      toast.success("Member invited successfully");
      closeModal();
      setSearchQuery("");
      setSelectedUser(null);
      setRoleId("");
    } catch (_) {
      if (inviteMember.error?.message?.includes("duplicate")) {
        toast.error("User is already a member of this project");
      } else {
        toast.error(`Failed to invite member: ${inviteMember.error?.message}`);
      }
    }
  };

  return (
    <DialogContent>
      <div className="grid gap-4 py-4">
        {/* User Search */}
        <div className="grid gap-2">
          <Label htmlFor="search">Search Users</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by username or name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedUser(null);
              }}
              className="pl-9"
            />
          </div>
        </div>

        {/* Search Results */}
        {searchQuery.length >= 2 && !selectedUser && (
          <div className="max-h-48 overflow-y-auto border rounded-md">
            {searchResults.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">No users found</div>
            ) : (
              searchResults.map((user) => (
                <button
                  type="submit"
                  key={user.id}
                  onClick={() => {
                    setSelectedUser(user);
                    setSearchQuery("");
                  }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-accent transition-colors"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback>{getUserInitials(user.full_name)}</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <div className="font-medium">{user.full_name}</div>
                    <div className="text-xs text-muted-foreground">@{user.username}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {/* Selected User */}
        {selectedUser && (
          <div className="flex items-center gap-3 p-3 border rounded-md bg-accent">
            <Avatar className="h-10 w-10">
              <AvatarImage src={selectedUser.avatar_url || undefined} />
              <AvatarFallback>{getUserInitials(selectedUser.full_name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-medium">{selectedUser.full_name}</div>
              <div className="text-sm text-muted-foreground">@{selectedUser.username}</div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>
              Change
            </Button>
          </div>
        )}

        {/* Role Selection */}
        <div className="grid gap-2">
          <Label htmlFor="role">Role</Label>
          <Select value={roleId} onValueChange={setRoleId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  <div>
                    <div className="font-medium">{role.name}</div>
                    {role.description && (
                      <div className="text-xs text-muted-foreground">{role.description}</div>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => closeModal()}>
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleInvite}
          disabled={!selectedUser || !roleId || inviteMember.isPending}
        >
          {inviteMember.isPending ? "Inviting..." : "Send Invitation"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
