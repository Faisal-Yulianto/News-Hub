import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface CreateCommentRequest {
  newsId: string;
  content: string;
  parentId?: string;
}

interface CreateCommentResponse {
  success: boolean;
  comment: {
    id: string;
    content: string;
    newsId: string;
    userId: string;
    parentId: string | null;
    depth: number;
    likeCount: number;
    replyCount: number;
    isEdited: boolean;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
    user: {
      id: string;
      name: string | null;
      avatar: string | null;
    };
  };
}

async function createComment(
  data: CreateCommentRequest
): Promise<CreateCommentResponse> {
  const res = await fetch('/api/comments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.error || 'Failed to create comment');
  }

  return res.json();
}

export function useCreateComment(newsId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommentRequest) => createComment(data),

    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['all-comment', newsId],
      });

      if (variables.parentId) {
        queryClient.invalidateQueries({
          queryKey: ['replies', variables.parentId],
        });
      }

      if (variables.parentId) {
        toast.success('Balasan terkirim!');
      } else {
        toast.success('Komentar terkirim!');
      }
    },

    onError: (error: Error) => {
      console.error('komentar error:', error);
      toast.error(error.message || 'Gagal mengirim komentar');
    },
  });
}