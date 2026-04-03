import { useQuery } from "@tanstack/react-query";

export interface EngagementMetrics {
  totalLikes: number;
  totalComments: number;
}

export interface TopArticle {
  id: string;
  title: string;
  slug: string;
  views: number;
  likeCount: number;
  commentCount: number;
  category: {
    name: string;
    slug: string;
  };
  author: {
    name: string;
  };
}

export interface CategoryPerformance {
  name: string;
  slug: string;
  articleCount: number;
  totalViews: number;
  totalLikes: number;
  avgViewsPerArticle: number;
}

export interface AuthorPerformance {
  name: string;
  avatar: string | null;
  articleCount: number;
  totalViews: number;
  totalLikes: number;
  avgViewsPerArticle: number;
}

export interface RecentActivity {
  id: string;
  type: "PUBLISH" | "COMMENT" | "LIKE";
  message: string;
  link: string;
  timestamp: string;
  user: {
    name: string;
    avatar: string | null;
  };
}

export interface UserBreakdown {
  loginVisits: number;
  nonLoginVisits: number;
  totalVisits: number;
  loginPercentage: number;
  nonLoginPercentage: number;
}

export interface InsightsData {
  engagement: EngagementMetrics;
  topArticles: TopArticle[];
  categoryPerformance: CategoryPerformance[];
  authorPerformance: AuthorPerformance[];
  recentActivities: RecentActivity[];
  userBreakdown: UserBreakdown;
  meta: {
    days: number;
    limit: number;
    fetchedAt: string;
  };
}

export function useAnalyticsInsights(days: number = 30, limit: number = 5) {
  return useQuery<InsightsData>({
    queryKey: ["analytics-insights", days, limit],
    queryFn: async () => {
      const response = await fetch(`/api/admin/analytics/insights?days=${days}&limit=${limit}`);
      if (!response.ok) {
        throw new Error("Failed to fetch insights data");
      }
      const result = await response.json();
      return result.data;
    },
  });
}