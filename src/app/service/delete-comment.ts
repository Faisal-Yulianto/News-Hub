import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface DeleteCommentRequest {
  commentId: string;
  newsId: string;
}

interface DeleteCommentResponse {
  success: boolean;
  message: string;
}

async function deleteComment(
  data: DeleteCommentRequest
): Promise<DeleteCommentResponse> {
  const res = await fetch(`/api/comments/${data.commentId}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.error || 'Failed to delete comment');
  }

  return res.json();
}

export function useDeleteComment(newsId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DeleteCommentRequest) => deleteComment(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['all-comment', newsId],
      });

      queryClient.invalidateQueries({
        queryKey: ['replies'],
      });

      toast.success('Komentar dihapus');
    },

    onError: (error: Error) => {
      console.error('Delete comment error:', error);
      toast.error(error.message || 'Gagal menghapus komentar');
    },
  });
}