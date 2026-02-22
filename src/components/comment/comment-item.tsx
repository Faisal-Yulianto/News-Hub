"use client";

import { commentItem } from "@/hooks/use-all-coments";
import { timeAgo } from "@/lib/time-helper";
import { LikeButton } from "./like-comment";
import { useState } from "react";
import { useReplies } from "@/hooks/use-all-repiles";
import {
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  MoreVertical,
  Edit2,
  Trash2,
} from "lucide-react";
import { useCreateComment } from "@/app/service/create-comment";
import { CommentForm } from "./comment-form";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useEditComment } from "@/app/service/edit-comment";
import { CommentEditForm } from "./edit-comment-form";
import { useDeleteComment } from "@/app/service/delete-comment";
import { DeleteCommentModal } from "./delete-confinrmation-modal";

interface CommentItemDisplayProps {
  comment: commentItem;
  newsId: string;
  depth: number;
}

export function CommentItemDisplay({
  comment,
  newsId,
  depth,
}: CommentItemDisplayProps) {
  const { data: session } = useSession();
  const isDeleted = !!comment.deletedAt;
  const isOwner = session?.user?.id === comment.userId;
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { mutate: createComment, isPending: isCreatingReply } =
    useCreateComment(newsId);
  const { mutate: editComment, isPending: isEditingComment } =
    useEditComment(newsId);
  const { mutate: deleteComment, isPending: isDeletingComment } =
    useDeleteComment(newsId);

  const {
    data: repliesData,
    isLoading: isLoadingReplies,
    isError: isErrorReplies,
    refetch: refetchReplies,
  } = useReplies(comment.id, showReplies);

  const replies = repliesData?.replies || [];

  const indentLevel = Math.min(depth, 5);
  const indent = indentLevel * 40;
  const maxDepth = 5;

  const handleToggleReplies = () => {
    setShowReplies(!showReplies);
  };

  const handleReplySubmit = (content: string) => {
    createComment(
      {
        newsId,
        content,
        parentId: comment.id,
      },
      {
        onSuccess: () => {
          setShowReplyForm(false);
          setShowReplies(true);
          refetchReplies();
        },
      },
    );
  };

  const handleEditSubmit = (content: string) => {
    editComment(
      {
        commentId: comment.id,
        content,
        newsId,
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      },
    );
  };

  const handleEditCancel = () => {
    setIsEditing(false);
  };
  const handleDeleteClick = () => {
    setShowDeleteModal(true);
    setShowMenu(false);
  };

  const handleDeleteConfirm = () => {
    deleteComment(
      {
        commentId: comment.id,
        newsId,
      },
      {
        onSuccess: () => {
          setShowDeleteModal(false);
        },
      },
    );
  };

  return (
    <>
      <div
        className="py-4 px-2 rounded-sm transition-colors hover:bg-gray-100 dark:hover:bg-black/20 group"
        style={{ marginLeft: `${indent}px` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-[45px] h-[45px] overflow-hidden rounded-full">
            <Image
              src={comment.user.avatar || "/default-avatar.png"}
              alt={comment.user.name || "User"}
              width={40}
              height={40}
              className="object-cover rounded-full"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {comment.user.name || "Anonymous"}
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500">
                  {timeAgo(comment.createdAt)}
                </span>
                {comment.isEdited && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-xs text-gray-500">(edited)</span>
                  </>
                )}
              </div>

              {isOwner && !isDeleted && (
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className={`p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-all ${
                      isHovered || showMenu ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <MoreVertical className="h-4 w-4 text-gray-500" />
                  </button>
                  {showMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowMenu(false)}
                      />
                      <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                        <button
                          onClick={() => {
                            setIsEditing(true);
                            setShowMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                          <Edit2 className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            handleDeleteClick();
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Hapus
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            {isEditing ? (
              <div className="mb-2">
                <CommentEditForm
                  initialContent={comment.content}
                  onSubmit={handleEditSubmit}
                  onCancel={handleEditCancel}
                  isSubmitting={isEditingComment}
                />
              </div>
            ) : (
              <p
                className={`text-sm whitespace-pre-wrap break-words mb-2 ${
                  isDeleted
                    ? "italic text-gray-400"
                    : "text-gray-800 dark:text-gray-200"
                }`}
              >
                {comment.content}
              </p>
            )}
            {!isDeleted && !isEditing && (
              <div className="flex items-center gap-4">
                <LikeButton
                  commentId={comment.id}
                  newsId={comment.newsId}
                  likeCount={comment.likeCount}
                  isLiked={comment.isLikedByCurrentUser || false}
                />
                {depth < maxDepth && (
                  <button
                    onClick={() => setShowReplyForm(!showReplyForm)}
                    className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Balas
                  </button>
                )}
                {comment.replyCount > 0 && (
                  <button
                    onClick={handleToggleReplies}
                    disabled={isLoadingReplies}
                    className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingReplies ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : showReplies ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        Sembunyikan
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        {comment.replyCount} Balasan
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
            {showReplyForm && !isDeleted && !isEditing && depth < maxDepth && (
              <div className="mt-3">
                <CommentForm
                  newsId={newsId}
                  parentId={comment.id}
                  parentAuthorName={comment.user.name || "komentar ini"}
                  onSubmit={handleReplySubmit}
                  onCancel={() => setShowReplyForm(false)}
                  isSubmitting={isCreatingReply}
                  placeholder={`Balas ke ${comment.user.name}...`}
                  submitLabel="Balas"
                  autoFocus
                />
              </div>
            )}
            {isErrorReplies && showReplies && (
              <div className="mt-2 text-sm text-red-600">
                Gagal menampilkan reply.{" "}
                <button
                  onClick={() => refetchReplies()}
                  className="underline hover:no-underline"
                >
                  Coba lagi
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {showReplies && replies.length > 0 && (
        <div>
          {replies.map((reply) => (
            <CommentItemDisplay
              key={reply.id}
              comment={reply}
              newsId={newsId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
      <DeleteCommentModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeletingComment}
      />
    </>
  );
}
