import { useInfiniteQuery } from "@tanstack/react-query";

interface NewsBookmarksItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  thumbnailUrl: string;
  publishedAt: string;
  views: number;
  author: { name: string };
}

interface NewsBookmarksPage {
  data: NewsBookmarksItem[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
  nextPage: number | null;
}

export interface UseAllBookmarksNewsProps {
  initialData?: NewsBookmarksPage;
  initialPage?: number;
}

export default function useAllBookmarksNews({
  initialData,
  initialPage = 1,
}: UseAllBookmarksNewsProps = {}) {
  const query = useInfiniteQuery<NewsBookmarksPage>({
    queryKey: ["all-bookmarks-news", initialPage],
    queryFn: async ({ pageParam }) => {
      const res = await fetch(`/api/bookmarks?page=${pageParam}&limit=2`);
      if (!res.ok) throw new Error("Failed to fetch bookmarks news");
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

  return query;
}
