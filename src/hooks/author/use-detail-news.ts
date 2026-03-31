import { useQuery } from '@tanstack/react-query';
import { NEWS_MANAGEMENT_QUERY_KEY } from './use-news-management';

export interface NewsManagementDetail {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  thumbnailUrl: string;
  thumbnailHash: string;
  status: string;
  isBreaking: boolean;
  views: number;
  likeCount: number;
  commentCount: number;
  source: string;
  metaTitle: string | null;
  metaDescription: string | null;
  rejectionReason: string | null;
  publishedAt: string | null;
  createdAt: string;
  authorId: string;
  category: { id: string; name: string; icon: string | null; slug: string | null };
  contentImages: {
    id: string;
    url: string;
    caption: string | null;
    imageHash: string | null;
  }[];
}

export async function fetchNewsManagementDetailService(
  id: string
): Promise<NewsManagementDetail> {
  const res = await fetch(`/api/author/news-management/${id}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to fetch news detail");
  return json;
}

export function useNewsManagementDetail(id: string) {
  return useQuery({
    queryKey: [...NEWS_MANAGEMENT_QUERY_KEY, id],
    queryFn: () => fetchNewsManagementDetailService(id),
    enabled: !!id,
  });
}