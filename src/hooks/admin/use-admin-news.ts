import { useQuery } from "@tanstack/react-query";

export interface AdminNews {
  id: string;
  title: string;
  status: string;
  isBreaking: boolean;
  publishedAt: string | null;
  createdAt: string;
  author: { name: string; avatar: string | null };
  category: { name: string };
}

export interface AdminNewsPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminNewsResponse {
  data: AdminNews[];
  pagination: AdminNewsPagination;
}

interface UseAdminNewsParams {
  status?: string;
  page?: number;
  search?: string;
}

export function useAdminNews({
  status = "PENDING_REVIEW",
  page = 1,
  search = "",
}: UseAdminNewsParams = {}) {
  return useQuery<AdminNewsResponse>({
    queryKey: ["admin-news", status, page, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        status,
        page: page.toString(),
        ...(search && { search }),
      });
      const response = await fetch(`/api/admin/news?${params}`);
      if (!response.ok) throw new Error("Failed to fetch news");
      return response.json();
    },
  });
}