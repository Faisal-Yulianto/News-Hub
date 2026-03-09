import { useQuery } from "@tanstack/react-query";

interface AnalyticsDaily {
  date: string;
  total: number;
}

export function useAnalyticsDaily() {
  return useQuery<AnalyticsDaily[], Error>({
    queryKey: ["analytics-daily"],
    queryFn: async () => {
      const response = await fetch("/api/admin/analytics/daily");
      if (!response.ok) {
        throw new Error("Failed to fetch daily analytics");
      }
      return response.json();
    },
  });
}