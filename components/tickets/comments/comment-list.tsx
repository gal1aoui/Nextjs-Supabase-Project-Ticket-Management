"use client";

import { MessageSquare } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectPermissions } from "@/hooks/use-project-permissions";
import { useUser } from "@/hooks/use-user";
import { useTicketComments } from "@/stores/ticket-comment.store";
import { CommentForm } from "./comment-form";
import { CommentItem } from "./comment-item";

interface CommentListProps {
  ticketId: string;
  projectId: string;
}

export function CommentList({ ticketId, projectId }: CommentListProps) {
  const { data: comments = [], isLoading } = useTicketComments(ticketId);
  const { data: user } = useUser();
  const { hasPermission } = useProjectPermissions(projectId);

  const currentUserId = user?.id ?? "";
  const canComment = hasPermission("comment") || hasPermission("manage_tickets");
  const canManageTickets = hasPermission("manage_tickets");

  return (
    <div className="space-y-4">
      <Separator />

      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Comments {comments.length > 0 && `(${comments.length})`}
        </h3>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {comments.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No comments yet. {canComment && "Be the first to comment!"}
            </p>
          )}

          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              ticketId={ticketId}
              currentUserId={currentUserId}
              canManageTickets={canManageTickets}
            />
          ))}
        </div>
      )}

      {canComment && currentUserId && (
        <>
          <Separator />
          <CommentForm
            ticketId={ticketId}
            projectId={projectId}
            currentUserId={currentUserId}
          />
        </>
      )}
    </div>
  );
}
