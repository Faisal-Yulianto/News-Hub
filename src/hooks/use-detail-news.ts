import { useQuery } from "@tanstack/react-query";

interface ContentImage {
  id: string;
  url: string;
  caption: string;
  newsId: string;
}
export type UserReaction = "like" | "dislike" | null;

export interface detailNewsItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  thumbnailUrl: string;
  views: number;
  source: string;
  metaTitle: string;
  metaDescription: string;
  likeCount: number;
  userReaction: UserReaction;
  disLike: number;
  commentCount: number;
  publishedAt: string;
  contentImages: ContentImage[];
  author: { name: string; avatar: string };
}

export interface detailNewsProps {
  slug: string;
  initialData: detailNewsItem;
}

export function useDetailNews({ slug, initialData }: detailNewsProps) {
  return useQuery<detailNewsItem>({
    queryKey: ["detail-news", slug],
    queryFn: async () => {
      const res = await fetch(`/api/news/${slug}`);
      if (!res.ok) {
        throw new Error("Failed to fetch detail news");
      }
      return res.json();
    },
    initialData,
    initialDataUpdatedAt: Date.now(),
    staleTime: 60000,
    refetchOnMount: "always", 
    refetchOnWindowFocus: false,
  });
}
