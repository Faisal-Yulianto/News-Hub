"use client";

import { Icon } from "@iconify/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface CategoryPerformanceData {
  name: string;
  slug: string;
  articleCount: number;
  totalViews: number;
  totalLikes: number;
  avgViewsPerArticle: number;
}

interface CategoryPerformanceProps {
  data: CategoryPerformanceData[];
}

export function CategoryPerformance({ data }: CategoryPerformanceProps) {
  const maxViews = Math.max(...data.map(c => c.totalViews), 1);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>📂 Performa Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Belum ada data kategori</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>📂 Performa Kategori (30 Hari Terakhir)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((category) => (
          <div key={category.slug} className="space-y-2">
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">{category.name}</span>
                <span className="text-muted-foreground">
                  ({category.articleCount} artikel)
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Icon icon="solar:eye-linear" className="h-3 w-3" />
                  {category.totalViews.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <Icon icon="solar:heart-linear" className="h-3 w-3 text-red-500" />
                  {category.totalLikes}
                </span>
              </div>
            </div>
            <Progress value={(category.totalViews / maxViews) * 100} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}