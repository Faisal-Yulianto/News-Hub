import { useQuery } from "@tanstack/react-query";

export interface CategoryNewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  thumbnailUrl: string;
  publishedAt: string;
  author: { name: string };
  category: { name: string; icon: string };
}

export interface CategoryNewsResponse {
  data: CategoryNewsItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
  nextPage?: number;
}

export type UseCategoryNewsParams = {
  category: string;
  page: number;
  limit?: number;
  sort?: string;
  timeRange?: string;
  initialData?: CategoryNewsResponse
};

export function useCategoryNews({
  category,
  page,
  limit = 10,
  sort = "newest",
  timeRange = "all",
  initialData
}: UseCategoryNewsParams) {
  return useQuery<CategoryNewsResponse>({
    queryKey: ["category-news", category, page, sort, timeRange,limit],
    queryFn: async () => {
      const res = await fetch(
        `/api/all-news?category=${category}&page=${page}&limit=${limit}&sort=${sort}&timeRange=${timeRange}`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch category news");
      }
      return res.json();
    },
    initialData,
    initialDataUpdatedAt: Date.now(),
    staleTime : 60000,
    placeholderData: (previousData) => previousData,
  });
}
