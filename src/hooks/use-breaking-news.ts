import { useQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";

interface BreakingNewsType {
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

export interface BreakingResponse {
  data: BreakingNewsType[];
}

export interface UseBreakingNewsProps {
  initialData?: BreakingResponse;
}

export default function UseBreakingNews({
  initialData,
}: UseBreakingNewsProps = {}) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: "200px",
  });

  const query = useQuery<BreakingResponse>({
    queryKey: ["breaking"],
    queryFn: async () => {
      const res = await fetch("/api/news?type=breaking");
      if (!res.ok) throw new Error("failed to fetch data");
      return res.json();
    },
    enabled: inView,
    initialData,
    staleTime: 60000,
  });

  return { ...query, ref };
}