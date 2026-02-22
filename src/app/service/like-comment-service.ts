import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { commentResponse, commentItem } from "@/hooks/use-all-coments";

interface LikeResponse {
  success: boolean;
  action: "liked" | "unliked";
  likeCount: number;
  isLiked: boolean;
}

interface PaginatedComments {
  pages: commentResponse[];
  pageParams?: unknown[];
}

interface RepliesData {
  replies: commentItem[];
}

async function toggleLikeComment(commentId: string): Promise<LikeResponse> {
  const res = await fetch(`/api/comments/${commentId}/like`, {
    method: "POST",
  });

  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.error || "Failed to like comment");
  }

  return res.json();
}

export function useLikeComment(newsId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => toggleLikeComment(commentId),

    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey: ["all-comment", newsId] });
      await queryClient.cancelQueries({ queryKey: ["replies"] });
      const previousRootComments = queryClient.getQueryData([
        "all-comment",
        newsId,
      ]);
      const updateComment = (comment: commentItem): commentItem => {
        if (comment.id !== commentId) return comment;

        const isLiked = comment.isLikedByCurrentUser ?? false;

        return {
          ...comment,
          isLikedByCurrentUser: !isLiked,
          likeCount: isLiked ? comment.likeCount - 1 : comment.likeCount + 1,
        };
      };

      queryClient.setQueryData<PaginatedComments | undefined>(
        ["all-comment", newsId],
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page: commentResponse) => ({
              ...page,
              comments: page.comments.map(updateComment),
            })),
          };
        },
      );

      const repliesQueries = queryClient.getQueriesData({
        queryKey: ["replies"],
      });

      repliesQueries.forEach(([queryKey, queryData]) => {
        if (queryData) {
          queryClient.setQueryData<RepliesData | undefined>(queryKey, (old) => {
            if (!old) return old;

            return {
              ...old,
              replies: old.replies.map(updateComment),
            };
          });
        }
      });

      return { previousRootComments };
    },

    onError: (err, commentId, context) => {
      if (context?.previousRootComments) {
        queryClient.setQueryData(
          ["all-comment", newsId],
          context.previousRootComments,
        );
      }

      queryClient.invalidateQueries({ queryKey: ["replies"] });

      toast.error("Gagal menyukai komentar");
    },

    onSuccess: (data, commentId) => {
      const updateWithServerData = (comment: commentItem): commentItem => {
        if (comment.id === commentId) {
          return {
            ...comment,
            likeCount: data.likeCount,
            isLikedByCurrentUser: data.isLiked,
          };
        }
        return comment;
      };
      queryClient.setQueryData<PaginatedComments | undefined>(
        ["all-comment", newsId],
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page: commentResponse) => ({
              ...page,
              comments: page.comments.map(updateWithServerData),
            })),
          };
        },
      );
      const repliesQueries = queryClient.getQueriesData({
        queryKey: ["replies"],
      });

      repliesQueries.forEach(([queryKey, queryData]) => {
        if (queryData) {
          queryClient.setQueryData<RepliesData | undefined>(queryKey, (old) => {
            if (!old) return old;

            return {
              ...old,
              replies: old.replies.map(updateWithServerData),
            };
          });
        }
      });
    },
  });
}
