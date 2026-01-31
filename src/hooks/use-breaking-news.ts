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

export default function UseBreakingNews() {
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
  });
  return { ...query, ref };
}
