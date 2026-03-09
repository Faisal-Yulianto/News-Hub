import { useQuery } from "@tanstack/react-query";

interface AnalyticsTopPages {
  page: string;
  total: number;
}

export function useAnalyticsTopPages() {
  return useQuery<AnalyticsTopPages[]>({
    queryKey: ["analytics-top-pages"],
    queryFn: async () => {
      const response = await fetch("/api/admin/analytics/top-pages");
      if (!response.ok) {
        throw new Error("Failed to fetch analytics overview");
      }
      return response.json();
    },
  });
}
