import { useQuery } from "@tanstack/react-query";

interface AnalyticsOverview {
  today: number;
  last7Days: number;
  last30Days: number;
  changeToday: number;
  change7Days: number;
  change30Days: number;
}

export function useAnalyticsOverview() {
  return useQuery<AnalyticsOverview>({
    queryKey: ["analytics-overview"],
    queryFn: async () => {
      const response = await fetch("/api/admin/analytics/overview");
      if (!response.ok) {
        throw new Error("Failed to fetch analytics overview");
      }
      return response.json();
    },
  });
}
