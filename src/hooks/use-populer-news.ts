import { useQuery } from "@tanstack/react-query";

interface PopulerNewsType {
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
interface PopulerResponse {
  data: PopulerNewsType[];
}

export interface PopulerNewsProps {
  initialData?: PopulerResponse
}

export function UsePopulerNews({initialData}:PopulerNewsProps) {
  return useQuery<PopulerResponse>({
    queryKey: ["populer"],
    queryFn: async () => {
      const res = await fetch("/api/news?type=populer");
      if (!res.ok) {
        throw new Error("failed to fetch data");
      }
      return res.json();
    },
    initialData,
    initialDataUpdatedAt: Date.now(),
    staleTime : 60000
  });
}
