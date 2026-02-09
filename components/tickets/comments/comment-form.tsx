"use client";

import { Eye, MessageSquare, Pencil, Send } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import Markdown from "react-markdown";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getUserInitials } from "@/lib/helpers";
import { useProfile } from "@/stores/profile.store";
import { useProjectMembers } from "@/stores/project-member.store";
import { useCreateComment } from "@/stores/ticket-comment.store";

interface CommentFormProps {
  ticketId: string;
  projectId: string;
  currentUserId: string;
}

export function CommentForm({ ticketId, projectId, currentUserId }: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionStart, setMentionStart] = useState(-1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const createComment = useCreateComment();
  const { data: currentProfile } = useProfile(currentUserId);
  const { data: members = [] } = useProjectMembers(projectId);

  const filteredMembers = useMemo(() => {
    if (!mentionQuery) return members.filter((m) => m.status === "active" && m.user_id !== currentUserId);
    const q = mentionQuery.toLowerCase();
    return members.filter(
      (m) => m.status === "active" && m.user_id !== currentUserId
    );
  }, [members, mentionQuery, currentUserId]);

  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      const cursorPos = e.target.selectionStart;
      setContent(value);

      // Detect @ trigger
      const textBeforeCursor = value.slice(0, cursorPos);
      const lastAtIndex = textBeforeCursor.lastIndexOf("@");

      if (lastAtIndex >= 0) {
        const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
        // Show mentions if @ is at start or preceded by whitespace, and no spaces in query
        const charBeforeAt = lastAtIndex > 0 ? value[lastAtIndex - 1] : " ";
        if ((charBeforeAt === " " || charBeforeAt === "\n" || lastAtIndex === 0) && !textAfterAt.includes(" ")) {
          setShowMentions(true);
          setMentionQuery(textAfterAt);
          setMentionStart(lastAtIndex);
          return;
        }
      }
      setShowMentions(false);
      setMentionQuery("");
    },
    []
  );

  const insertMention = useCallback(
    (userId: string, displayName: string) => {
      if (mentionStart < 0) return;
      const before = content.slice(0, mentionStart);
      const cursorPos = textareaRef.current?.selectionStart ?? content.length;
      const after = content.slice(cursorPos);
      const mention = `@[${userId}](${displayName}) `;
      const newContent = before + mention + after;
      setContent(newContent);
      setShowMentions(false);
      setMentionQuery("");
      textareaRef.current?.focus();
    },
    [content, mentionStart]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await createComment.mutateAsync({ ticket_id: ticketId, content });
      setContent("");
      setIsPreview(false);
      toast.success("Comment added");
    } catch (_) {
      toast.error("Failed to add comment");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
    if (e.key === "Escape" && showMentions) {
      setShowMentions(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={currentProfile?.avatar_url || undefined} />
          <AvatarFallback className="text-xs">
            {getUserInitials(currentProfile?.full_name ?? null)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 relative">
          <div className="flex items-center gap-1 mb-2">
            <Button
              type="button"
              variant={isPreview ? "ghost" : "secondary"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setIsPreview(false)}
            >
              <Pencil className="h-3 w-3 mr-1" />
              Write
            </Button>
            <Button
              type="button"
              variant={isPreview ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setIsPreview(true)}
              disabled={!content.trim()}
            >
              <Eye className="h-3 w-3 mr-1" />
              Preview
            </Button>
          </div>

          {isPreview ? (
            <div className="min-h-[80px] rounded-md border p-3 prose prose-sm dark:prose-invert max-w-none text-sm [&_p]:my-1">
              <Markdown>{content || "*Nothing to preview*"}</Markdown>
            </div>
          ) : (
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={content}
                onChange={handleContentChange}
                onKeyDown={handleKeyDown}
                placeholder="Add a comment... (Markdown supported, @ to mention)"
                className="min-h-[80px] text-sm resize-none"
              />

              {/* @mention dropdown */}
              {showMentions && (
                <MentionDropdown
                  members={filteredMembers}
                  query={mentionQuery}
                  onSelect={insertMention}
                  onClose={() => setShowMentions(false)}
                />
              )}
            </div>
          )}

          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-muted-foreground">
              Ctrl+Enter to submit
            </span>
            <Button
              type="submit"
              size="sm"
              disabled={createComment.isPending || !content.trim()}
            >
              {createComment.isPending ? (
                "Posting..."
              ) : (
                <>
                  <Send className="h-3.5 w-3.5 mr-1.5" />
                  Comment
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

function MentionDropdown({
  members,
  query,
  onSelect,
  onClose,
}: {
  members: { user_id: string; status: string }[];
  query: string;
  onSelect: (userId: string, displayName: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute left-0 bottom-full mb-1 w-64 max-h-48 overflow-y-auto border rounded-md bg-popover shadow-md z-50">
      {members.length === 0 ? (
        <div className="p-3 text-sm text-muted-foreground text-center">
          No members found
        </div>
      ) : (
        members.map((member) => (
          <MentionItem
            key={member.user_id}
            userId={member.user_id}
            query={query}
            onSelect={onSelect}
          />
        ))
      )}
    </div>
  );
}

function MentionItem({
  userId,
  query,
  onSelect,
}: {
  userId: string;
  query: string;
  onSelect: (userId: string, displayName: string) => void;
}) {
  const { data: profile } = useProfile(userId);

  // Client-side filtering
  if (query && profile) {
    const q = query.toLowerCase();
    const nameMatch = profile.full_name?.toLowerCase().includes(q);
    const usernameMatch = profile.username?.toLowerCase().includes(q);
    if (!nameMatch && !usernameMatch) return null;
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(userId, profile?.full_name || profile?.username || "user")}
      className="w-full flex items-center gap-2 p-2 hover:bg-accent transition-colors text-left"
    >
      <Avatar className="h-6 w-6">
        <AvatarImage src={profile?.avatar_url || undefined} />
        <AvatarFallback className="text-[10px]">
          {getUserInitials(profile?.full_name ?? null)}
        </AvatarFallback>
      </Avatar>
      <div>
        <div className="text-sm font-medium">{profile?.full_name || "Loading..."}</div>
        {profile?.username && (
          <div className="text-xs text-muted-foreground">@{profile.username}</div>
        )}
      </div>
    </button>
  );
}
