"use client";

import { Icon } from "@iconify/react";
import { useAuthorDashboard } from "@/hooks/author/use-news-dashboard";
import { AuthorOverviewCards } from "@/components/author/overview-card";
import { AuthorTopArticles } from "@/components/author/top-news";
import { AuthorDailyChart } from "@/components/author/daily-chart";
import { Skeleton } from "@/components/ui/skeleton";

export default function AuthorDashboardPage() {
  const { data, isLoading, isError } = useAuthorDashboard();

  if (isLoading) {
    return (
      <main className="flex flex-col gap-y-6 pb-10">
        <div className="flex items-center pb-2 px-2 gap-x-2 border-b">
          <Icon icon="ix:dashboard-filled" className="text-3xl" />
          <h1 className="text-2xl font-bold">Dashboard Author</h1>
        </div>
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
        </div>
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className="flex flex-col gap-y-6 pb-10">
        <div className="flex items-center pb-2 px-2 gap-x-2 border-b">
          <Icon icon="ix:dashboard-filled" className="text-3xl" />
          <h1 className="text-2xl font-bold">Dashboard Author</h1>
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
        <h1 className="text-2xl font-bold">Dashboard Author</h1>
      </div>

      <AuthorOverviewCards data={data.overview} />

      <div className="grid gap-4 lg:grid-cols-2">
        <AuthorTopArticles data={data.topArticles} />
        <AuthorDailyChart data={data.dailyViews} />
      </div>
    </main>
  );
}
