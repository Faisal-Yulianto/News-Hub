import { useQuery } from "@tanstack/react-query";

export interface AuthorOverview {
  totalArticles: number;
  status: {
    DRAFT: number;
    PENDING_REVIEW: number;
    PUBLISHED: number;
    REJECTED: number;
  };
  totalViews: number;
  totalLikes: number;
  totalComments: number;
}

export interface AuthorTopArticle {
  id: string;
  title: string;
  slug: string;
  views: number;
  likeCount: number;
  commentCount: number;
  status: string;
  publishedAt: string | null;
  category: {
    name: string;
  };
}

export interface AuthorDailyView {
  date: string;
  total: number;
}

export interface AuthorDashboardData {
  overview: AuthorOverview;
  topArticles: AuthorTopArticle[];
  dailyViews: AuthorDailyView[];
  meta: {
    days: number;
    limit: number;
    fetchedAt: string;
  };
}

export function useAuthorDashboard(days: number = 30, limit: number = 5) {
  return useQuery<AuthorDashboardData>({
    queryKey: ["author-dashboard", days, limit],
    queryFn: async () => {
      const response = await fetch(`/api/author/dashboard?days=${days}&limit=${limit}`);
      if (!response.ok) {
        throw new Error("Failed to fetch author dashboard data");
      }
      const result = await response.json();
      return result.data;
    },
  });
}