"use client";

import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
import Markdown from "react-markdown";
import { toast } from "sonner";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { getUserInitials } from "@/lib/helpers";
import { useDeleteComment, useUpdateComment } from "@/stores/ticket-comment.store";
import type { TicketCommentWithAuthor } from "@/types/ticket-comment";

interface CommentItemProps {
  comment: TicketCommentWithAuthor;
  ticketId: string;
  currentUserId: string;
  canManageTickets: boolean;
}

export function CommentItem({
  comment,
  ticketId,
  currentUserId,
  canManageTickets,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const updateComment = useUpdateComment();
  const deleteComment = useDeleteComment();

  const isAuthor = comment.user_id === currentUserId;
  const canEdit = isAuthor;
  const canDelete = isAuthor || canManageTickets;

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;

    try {
      await updateComment.mutateAsync({
        id: comment.id,
        content: editContent,
        ticketId,
      });
      setIsEditing(false);
      toast.success("Comment updated");
    } catch (_) {
      toast.error("Failed to update comment");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteComment.mutateAsync({ id: comment.id, ticketId });
      setDeleteDialogOpen(false);
      toast.success("Comment deleted");
    } catch (_) {
      toast.error("Failed to delete comment");
    }
  };

  const timeAgo = getRelativeTime(comment.created_at);
  const wasEdited = comment.updated_at !== comment.created_at;

  return (
    <>
      <div className="flex gap-3 group">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={comment.author?.avatar_url || undefined} />
          <AvatarFallback className="text-xs">
            {getUserInitials(comment.author?.full_name ?? null)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{comment.author?.full_name || "Unknown"}</span>
            <span className="text-xs text-muted-foreground">
              {timeAgo}
              {wasEdited && " (edited)"}
            </span>

            {(canEdit || canDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canEdit && (
                    <DropdownMenuItem
                      onClick={() => {
                        setEditContent(comment.content);
                        setIsEditing(true);
                      }}
                    >
                      <Edit className="h-3.5 w-3.5 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {canDelete && (
                    <DropdownMenuItem
                      onClick={() => setDeleteDialogOpen(true)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {isEditing ? (
            <div className="mt-2 space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[80px] text-sm"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={updateComment.isPending || !editContent.trim()}
                >
                  {updateComment.isPending ? "Saving..." : "Save"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-1 prose prose-sm dark:prose-invert max-w-none text-sm [&_p]:my-1 [&_pre]:my-2 [&_ul]:my-1 [&_ol]:my-1">
              <Markdown>{renderMentions(comment.content)}</Markdown>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/**
 * Replace @[uuid] with **@username** for markdown rendering.
 * The actual username resolution happens at display time.
 */
function renderMentions(content: string): string {
  return content.replace(
    /@\[([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\]\(([^)]+)\)/gi,
    "**@$2**"
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
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
