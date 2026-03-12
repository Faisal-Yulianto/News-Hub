import { useQuery } from "@tanstack/react-query";

export interface AdminNewsDetail {
  id: string;
  title: string;
  content: string;
  thumbnailUrl: string;
  status: string;
  isBreaking: boolean;
  rejectionReason: string | null;
  reviewedAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  author: { name: string; avatar: string | null };
  category: { name: string };
  contentImages: { url: string }[];
}

export function useAdminNewsDetail(id: string) {
  return useQuery<AdminNewsDetail>({
    queryKey: ["admin-news-detail", id],
    queryFn: async () => {
      const response = await fetch(`/api/admin/news/${id}`);
      if (!response.ok) throw new Error("Failed to fetch news detail");
      return response.json();
    },
    enabled: !!id,
  });
}