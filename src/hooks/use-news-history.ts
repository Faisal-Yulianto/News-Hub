import { useInfiniteQuery } from "@tanstack/react-query";

export interface News {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  author: {
    name: string;
  };
  thumbnailUrl: string;
  createdAt: string;
}

export interface History {
  id: string;
  userId: string;
  newsId: string;
  lastViewedAt: string;
  createdAt: string;
  deletedAt: string | null;
  news: News;
}

export interface GroupedHistory {
  today: History[];
  yesterday: History[];
  last7Days: History[];
  older: History[];
}

export interface HistoryResponse {
  data: GroupedHistory;
  responseAnchor: string | null;
  nextCursor: string | null;
}

export interface HistoryPageParam {
  cursor?: string;
  anchor?: string;
}

const fetchHistory = async ({
  pageParam,
}: {
  pageParam: HistoryPageParam;
}): Promise<HistoryResponse> => {
  const params = new URLSearchParams();

  if (pageParam?.cursor) {
    params.set("cursor", pageParam.cursor);
  }

  if (pageParam?.anchor) {
    params.set("anchor", pageParam.anchor);
  }

  const res = await fetch(`/api/history?${params.toString()}`);

  if (!res.ok) {
    throw new Error("Failed to fetch history");
  }

  return res.json();
};

export const useHistoryQuery = () => {
  return useInfiniteQuery<
    HistoryResponse,
    Error,
    HistoryResponse,
    ["history"],
    HistoryPageParam
  >({
    queryKey: ["history"],
    queryFn: fetchHistory,
    initialPageParam: {},
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.nextCursor) return undefined;
      return {
        cursor: lastPage.nextCursor,
        anchor:
          allPages[0]?.responseAnchor ?? lastPage.responseAnchor ?? undefined,
      };
    },
    staleTime: 1000 * 60 * 5,
  });
};
