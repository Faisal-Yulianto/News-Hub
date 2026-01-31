import { useQuery } from '@tanstack/react-query';
import { commentResponse } from './use-all-coments';

interface RepliesResponse {
  replies: commentResponse['comments'];
  pagination: commentResponse['pagination'];
}

async function fetchReplies(
  commentId: string,
  page: number = 1,
  limit: number = 5
): Promise<RepliesResponse> {
  const res = await fetch(
    `/api/comments/${commentId}/replies?page=${page}&limit=${limit}`
  );

  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.error || 'Failed to fetch replies');
  }

  return res.json();
}

export function useReplies(commentId: string, enabled: boolean = false) {
  return useQuery({
    queryKey: ['replies', commentId],
    queryFn: () => fetchReplies(commentId, 1, 20),
    enabled: enabled && !!commentId, 
    staleTime: 30 * 1000, 
  });
}