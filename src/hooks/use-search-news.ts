import { useQuery } from "@tanstack/react-query";
import type { DropdownOption } from "@/app/search-news/page";

export interface searchNewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  thumbnailUrl: string;
  publishedAt: string;
  author: { name: string };
  category: { name: string; icon: string };
}

export interface searchNewsResponse {
  data: searchNewsItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
  nextPage?: number;
}

export type UseSearchNewsParams = {
  category: string;
  page: number;
  limit?: number;
  sort?: string;
  timeRange?: string;
  query?: string;
  categoryOptions: DropdownOption[];
};

export function useSearchNews({
  category,
  page,
  limit = 10,
  sort = "newest",
  timeRange = "all",
  query ="",
}: UseSearchNewsParams) {
  return useQuery<searchNewsResponse>({
    queryKey: ["search-news", category, page, sort, query, timeRange, limit],
    queryFn: async () => {
      const res = await fetch(
        `/api/all-news?q=${encodeURIComponent(query)}&category=${category}&page=${page}&limit=${limit}&sort=${sort}&timeRange=${timeRange}`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch category news");
      }
      return res.json();
    },
    placeholderData: (previousData) => previousData,
  });
}
