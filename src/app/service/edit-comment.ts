import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface EditCommentRequest {
  commentId: string;
  content: string;
  newsId: string;
}

interface EditCommentResponse {
  success: boolean;
  comment: {
    id: string;
    content: string;
    isEdited: boolean;
    updatedAt: string;
  };
}

async function editComment(
  data: EditCommentRequest
): Promise<EditCommentResponse> {
  const res = await fetch(`/api/comments/${data.commentId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: data.content,
    }),
  });

  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.error || 'Failed to edit comment');
  }

  return res.json();
}

export function useEditComment(newsId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EditCommentRequest) => editComment(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['all-comment', newsId],
      });

      queryClient.invalidateQueries({
        queryKey: ['replies'],
      });

      toast.success('Komentar berhasil diperbarui!');
    },

    onError: (error: Error) => {
      console.error('Edit komenar error', error);
      toast.error(error.message || 'Gagal memperbarui komentar');
    },
  });
}