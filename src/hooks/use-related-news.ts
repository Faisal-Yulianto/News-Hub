import { useQuery } from "@tanstack/react-query";

interface ContentImage {
  id: string;
  url: string;
  caption: string;
  newsId: string;
}

export interface RelatedNewsItem {
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
  disLike: number;
  commentCount: number;
  publishedAt: string;
  contentImages: ContentImage[];
  author: { name: string; avatar: string };
}

export interface relatedNewsProps {
  slug: string;
  initialData: RelatedNewsItem[];
}

export function UseRelatedNews({ slug, initialData }: relatedNewsProps) {
  return useQuery<RelatedNewsItem[]>({
    queryKey: ["related-news", slug],
    queryFn: async () => {
      const res = await fetch(`/api/news/${slug}/related`);
      const json = await res.json();
      if (!res.ok) throw { message: json.message, status: res.status };
      return json.data;
    },
    initialData,
    initialDataUpdatedAt: Date.now(),
    staleTime: 60000,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });
}
