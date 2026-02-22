import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  thumbnailUrl: string;
  publishedAt: string;
  views: number;
  author: { name: string };
}

interface NewsPage {
  data: NewsItem[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
  nextPage: number | null;
}

export interface UseAllNewsProps {
  initialData?: NewsPage;
  initialPage?: number;
}

export default function useAllNewsInfinite({
  initialData,
  initialPage = 1,
}: UseAllNewsProps = {}) {
  const query = useInfiniteQuery<NewsPage>({
    queryKey: ["all-news", initialPage],
    queryFn: async ({ pageParam }) => {
      const res = await fetch(`/api/news?page=${pageParam}&limit=20`);
      if (!res.ok) throw new Error("Failed to fetch news");
      return res.json();
    },
    initialPageParam: initialPage,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialData: initialData
      ? { pages: [initialData], pageParams: [initialPage] }
      : undefined,
    initialDataUpdatedAt: Date.now(),
    staleTime: 60000,
  });

  useEffect(() => {
    if (!query.data?.pages) return;

    const lastPage = query.data.pages[query.data.pages.length - 1];
    const currentPage = lastPage?.page ?? 1;

    const newUrl = currentPage <= 1 ? "/" : `/?page=${currentPage}`;
    window.history.pushState(null, "", newUrl);
  }, [query.data?.pages]);

  return query;
}
