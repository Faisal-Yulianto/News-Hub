import { useInfiniteQuery } from "@tanstack/react-query";
import { useCommentSortStore } from "@/app/store/comment-sorting";

interface Author {
  id: string;
  name: string;
  avatar: string;
}

export interface commentItem {
  id: string;
  content: string;
  newsId: string;
  userId: string;
  parentId: string | null ;
  depth: number;
  likeCount: number;
  replyCount: number;
  deletedAt: string | null;
  isEdited: boolean;
  createdAt: string;
  news: { commentCount: number };
  user: Author;
  isLikedByCurrentUser?: boolean;
}

export interface commentResponse {
  comments: commentItem[];
  pagination :{
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
  }
}

export interface allCommentProps { 
  newsId: string;
}

export function useAllComments({newsId}:allCommentProps) {
  const sort = useCommentSortStore((s) => s.sort);
  return useInfiniteQuery<commentResponse,Error>({
    queryKey: ["all-comment",newsId,sort],
    initialPageParam: 1,
    queryFn: async ({pageParam}) => {
        const res = await fetch(`/api/comments?newsId=${newsId}&sort=${sort}&page=${pageParam}&limit=${5}`);
        const json = await res.json();
        if (!res.ok) {
            throw { message: json.message,status: json.status};
        }
        return json;
    },
    getNextPageParam: (lastPage) => {
        return lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined;
    }
  })
  
}
