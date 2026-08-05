"use client";

import { publicAuthClient } from "@repo/auth/public-client";
import { publicApi } from "@repo/trpc/public/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@repo/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { Button } from "@repo/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu";
import { Textarea } from "@repo/ui/textarea";
import { Loader2, MoreHorizontal, UserX } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type CommentAuthor = {
  id: string;
  name: string;
  image: string | null;
  profile: { username: string } | null;
};

type CommentData = {
  id: string;
  authorId: string;
  body: string;
  deletedAt: string | Date | null;
  createdAt: string | Date;
  author: CommentAuthor;
  replies?: CommentData[];
};

function initialsFor(name: string) {
  return name.slice(0, 2).toUpperCase();
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function CommentActions({
  comment,
  postId,
  postAuthorId,
  viewerId,
  onEdit,
}: {
  comment: CommentData;
  postId: string;
  postAuthorId: string;
  viewerId: string;
  onEdit: () => void;
}) {
  const utils = publicApi.useUtils();

  const deleteComment = publicApi.comment.delete.useMutation({
    onSuccess: () => utils.comment.listByPost.invalidate({ postId }),
  });

  const blockUser = publicApi.block.block.useMutation({
    onSuccess: () => {
      utils.comment.listByPost.invalidate({ postId });
      utils.post.list.invalidate();
    },
  });

  const isOwner = comment.authorId === viewerId;
  const isPostAuthor = postAuthorId === viewerId;

  if (!isOwner && !isPostAuthor) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="size-7 text-muted-foreground"
        title={`Block ${comment.author.name}`}
        disabled={blockUser.isPending}
        onClick={() => blockUser.mutate({ userId: comment.authorId })}
      >
        <UserX className="size-3.5" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-7 text-muted-foreground">
          <MoreHorizontal className="size-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {isOwner && <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              onSelect={(event) => event.preventDefault()}
              className="text-destructive"
            >
              Delete
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this comment?</AlertDialogTitle>
              <AlertDialogDescription>
                This can't be undone. Replies to it will stay visible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={deleteComment.isPending}
                onClick={() => deleteComment.mutate({ id: comment.id })}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CommentItem({
  comment,
  postId,
  postAuthorId,
  viewerId,
  isReply,
  replyOpen,
  onToggleReply,
  replySlot,
}: {
  comment: CommentData;
  postId: string;
  postAuthorId: string;
  viewerId?: string | undefined;
  isReply: boolean;
  replyOpen: boolean;
  onToggleReply?: (() => void) | undefined;
  replySlot?: React.ReactNode;
}) {
  const utils = publicApi.useUtils();
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(comment.body);

  const updateComment = publicApi.comment.update.useMutation({
    onSuccess: () => {
      setEditing(false);
      utils.comment.listByPost.invalidate({ postId });
    },
  });

  const isDeleted = !!comment.deletedAt;

  return (
    <div className={isReply ? "pl-10" : undefined}>
      <div className="flex gap-3">
        <Avatar size="sm">
          <AvatarImage src={comment.author.image ?? undefined} alt={comment.author.name} />
          <AvatarFallback>{initialsFor(comment.author.name)}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-2 text-sm">
              {comment.author.profile ? (
                <Link
                  href={`/u/${comment.author.profile.username}`}
                  className="font-medium hover:underline"
                >
                  {comment.author.name}
                </Link>
              ) : (
                <span className="font-medium">{comment.author.name}</span>
              )}
              <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
            </div>

            {!isDeleted && viewerId && (
              <CommentActions
                comment={comment}
                postId={postId}
                postAuthorId={postAuthorId}
                viewerId={viewerId}
                onEdit={() => {
                  setEditValue(comment.body);
                  setEditing(true);
                }}
              />
            )}
          </div>

          {isDeleted ? (
            <p className="text-sm text-muted-foreground italic">[deleted]</p>
          ) : editing ? (
            <div className="mt-1 flex flex-col gap-2">
              <Textarea
                value={editValue}
                onChange={(event) => setEditValue(event.target.value)}
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={!editValue.trim() || updateComment.isPending}
                  onClick={() => updateComment.mutate({ id: comment.id, body: editValue })}
                >
                  {updateComment.isPending && <Loader2 className="size-3.5 animate-spin" />}
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-1 text-sm whitespace-pre-wrap">{comment.body}</p>
          )}

          {!isReply && !isDeleted && viewerId && (
            <button
              type="button"
              className="mt-1 cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground"
              onClick={onToggleReply}
            >
              {replyOpen ? "Cancel" : "Reply"}
            </button>
          )}
        </div>
      </div>

      {replySlot}
    </div>
  );
}

function ReplyForm({
  postId,
  parentCommentId,
  onDone,
}: {
  postId: string;
  parentCommentId: string;
  onDone: () => void;
}) {
  const [value, setValue] = useState("");
  const utils = publicApi.useUtils();

  const createComment = publicApi.comment.create.useMutation({
    onSuccess: () => {
      setValue("");
      onDone();
      utils.comment.listByPost.invalidate({ postId });
    },
  });

  return (
    <div className="mt-2 flex flex-col gap-2 pl-10">
      <Textarea
        autoFocus
        rows={2}
        placeholder="Write a reply…"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onDone}>
          Cancel
        </Button>
        <Button
          size="sm"
          disabled={!value.trim() || createComment.isPending}
          onClick={() => createComment.mutate({ postId, parentCommentId, body: value })}
        >
          {createComment.isPending && <Loader2 className="size-3.5 animate-spin" />}
          Reply
        </Button>
      </div>
    </div>
  );
}

export function CommentSection({
  postId,
  postAuthorId,
}: {
  postId: string;
  postAuthorId: string;
}) {
  const { data: session } = publicAuthClient.useSession();
  const utils = publicApi.useUtils();
  const { data: comments, isLoading } = publicApi.comment.listByPost.useQuery({ postId });
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const createComment = publicApi.comment.create.useMutation({
    onSuccess: () => {
      setNewComment("");
      utils.comment.listByPost.invalidate({ postId });
    },
  });

  return (
    <div className="flex flex-col gap-6 border-t border-border/60 pt-8">
      <h2 className="text-lg font-semibold">Comments</h2>

      {session ? (
        <div className="flex flex-col gap-2">
          <Textarea
            placeholder="Add a comment…"
            rows={3}
            value={newComment}
            onChange={(event) => setNewComment(event.target.value)}
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              disabled={!newComment.trim() || createComment.isPending}
              onClick={() => createComment.mutate({ postId, body: newComment })}
            >
              {createComment.isPending && <Loader2 className="size-3.5 animate-spin" />}
              Comment
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
            Log in
          </Link>{" "}
          to join the conversation.
        </p>
      )}

      {isLoading && <p className="text-sm text-muted-foreground">Loading comments…</p>}

      {!isLoading && comments?.length === 0 && (
        <p className="text-sm text-muted-foreground">No comments yet.</p>
      )}

      <div className="flex flex-col gap-6">
        {comments?.map((topLevel) => (
          <CommentItem
            key={topLevel.id}
            comment={topLevel}
            postId={postId}
            postAuthorId={postAuthorId}
            viewerId={session?.user.id}
            isReply={false}
            replyOpen={replyingTo === topLevel.id}
            onToggleReply={() =>
              setReplyingTo((current) => (current === topLevel.id ? null : topLevel.id))
            }
            replySlot={
              <div className="mt-3 flex flex-col gap-3">
                {topLevel.replies?.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    postId={postId}
                    postAuthorId={postAuthorId}
                    viewerId={session?.user.id}
                    isReply
                    replyOpen={false}
                  />
                ))}
                {replyingTo === topLevel.id && (
                  <ReplyForm
                    postId={postId}
                    parentCommentId={topLevel.id}
                    onDone={() => setReplyingTo(null)}
                  />
                )}
              </div>
            }
          />
        ))}
      </div>
    </div>
  );
}
