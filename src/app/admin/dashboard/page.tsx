"use client";

import { CardOverview } from "@/components/admin/card-overview";
import { DailyAnalyticsChart } from "@/components/admin/daily-chart";
import { TopPagesChart } from "@/components/admin/top-pages-chart";
import { EngagementCards } from "@/components/admin/engagement-card";
import { TopArticlesTable } from "@/components/admin/top-article-table";
import { AuthorLeaderboard } from "@/components/admin/author-leaderboard";
import { CategoryPerformance } from "@/components/admin/category-performance";
import { RecentActivities } from "@/components/admin/recent-activities";
import { UserBreakdown } from "@/components/admin/user-breakdown";
import { Icon } from "@iconify/react";
import { useAnalyticsInsights } from "@/hooks/admin/use-analytics-insight";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { data, isLoading, isError } = useAnalyticsInsights();
  if (isLoading) {
    return (
      <main className="flex flex-col gap-y-6 pb-10">
        <div className="flex items-center pb-2 px-2 gap-x-2 border-b">
          <Icon icon="ix:dashboard-filled" className="text-3xl" />
          <h1 className="text-2xl font-bold">Dashboard Administrator</h1>
        </div>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <Skeleton className="h-24 w-full" />
          <div className="grid gap-4 lg:grid-cols-2">
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </main>
    );
  }
  if (isError || !data) {
    return (
      <main className="flex flex-col gap-y-6 pb-10">
        <div className="flex items-center pb-2 px-2 gap-x-2 border-b">
          <Icon icon="ix:dashboard-filled" className="text-3xl" />
          <h1 className="text-2xl font-bold">Dashboard Administrator</h1>
        </div>
        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10">
          <Icon
            icon="solar:danger-triangle-linear"
            className="h-10 w-10 text-destructive"
          />
          <p className="text-destructive">Gagal memuat data dashboard</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-primary hover:underline"
          >
            Coba lagi
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-y-6 pb-10">
      <div className="flex items-center pb-2 px-2 gap-x-2 border-b">
        <Icon icon="ix:dashboard-filled" className="text-3xl" />
        <h1 className="text-2xl font-bold">
          Selamat Datang di Dashboard, Administrator
        </h1>
      </div>

      <CardOverview />
      <DailyAnalyticsChart />
      <TopPagesChart />
      <EngagementCards data={data.engagement} />

      <div className="grid gap-4 lg:grid-cols-2">
        <TopArticlesTable data={data.topArticles} />
        <AuthorLeaderboard data={data.authorPerformance} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <CategoryPerformance data={data.categoryPerformance} />
        <UserBreakdown data={data.userBreakdown} />
      </div>

      <RecentActivities data={data.recentActivities} />
    </main>
  );
}
