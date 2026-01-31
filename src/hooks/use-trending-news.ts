import { useQuery } from "@tanstack/react-query";

interface TrendingNews {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  thumbnailUrl: string;
  publishedAt: string;
  author: {
    name: string;
  };
}
interface TrendingResponse {
  data: TrendingNews[];
}
export interface TrendingNewsProps {
  initialData?:TrendingResponse;
}

export function UseTrendingNews({initialData}:TrendingNewsProps = {}) {
  return useQuery<TrendingResponse>({
    queryKey: ["trending"],
    queryFn: async () => {
      const res = await fetch("/api/news?type=trending");
      if (!res.ok) throw new Error("failed to fetch data");
      return res.json();
    },
    initialData,
    initialDataUpdatedAt: Date.now(),
    staleTime:60000
  });
}
