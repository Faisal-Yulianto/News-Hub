import { useQuery } from "@tanstack/react-query";

export interface NewsManagementItem {
  id: string;
  title: string;
  slug: string;
  status: string;
  isBreaking: boolean;
  rejectionReason: string | null;
  createdAt: string;
  publishedAt: string | null;
  category: { id: string; name: string; icon: string | null };
}

export interface NewsManagementPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface NewsManagementResponse {
  data: NewsManagementItem[];
  pagination: NewsManagementPagination;
}
export const NEWS_MANAGEMENT_QUERY_KEY = ["author", "news-management","all-news","category-news","breaking","trending","populer","related-news"];

export async function fetchNewsManagementService(params: {
  status: string;
  page: number;
  search: string;
}): Promise<NewsManagementResponse> {
  const query = new URLSearchParams({
    status: params.status,
    page: String(params.page),
    search: params.search,
  });
  const res = await fetch(`/api/author/news-management?${query}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to fetch news");
  return json;
}

export function useNewsManagement(params: {
  status: string;
  page: number;
  search: string;
}) {
  return useQuery({
    queryKey: [...NEWS_MANAGEMENT_QUERY_KEY, params],
    queryFn: () => fetchNewsManagementService(params),
    placeholderData: (prev) => prev,
  });
}
