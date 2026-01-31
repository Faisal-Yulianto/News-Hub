import { useInfiniteQuery } from "@tanstack/react-query";

export interface AllNewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  thumbnailUrl: string;
  publishedAt: string;
  author: { name: string;};
}

export interface AllNewsResponse {
  data: AllNewsItem[];
  nextPage?: number;
  hasMore: boolean;
}

type UseAllNewsOptions = {
  pageSize?: number;
};

export default function useAllNewsInfinite(options?: UseAllNewsOptions) {
  const pageSize = options?.pageSize ?? 10;
  return useInfiniteQuery<AllNewsResponse, Error>({
    queryKey: ["all-news"],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const res = await fetch(`/api/news?page=${pageParam}&limit=${pageSize}`);
      if (!res.ok) throw new Error("Failed to fetch all-news");
      return res.json();
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextPage : undefined,
  });
}
