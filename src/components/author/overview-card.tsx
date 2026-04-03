"use client";

import { Icon } from "@iconify/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthorOverviewProps {
  data: {
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
  };
}

export function AuthorOverviewCards({ data }: AuthorOverviewProps) {
  const statusCards = [
    {
      label: "Draft",
      value: data.status.DRAFT,
      icon: "solar:document-add-bold",
      bg: "bg-gray-100 dark:bg-gray-800",
      textColor: "text-gray-600",
    },
    {
      label: "Menunggu Review",
      value: data.status.PENDING_REVIEW,
      icon: "solar:clock-circle-bold",
      bg: "bg-yellow-100 dark:bg-yellow-950",
      textColor: "text-yellow-600",
    },
    {
      label: "Dipublikasi",
      value: data.status.PUBLISHED,
      icon: "solar:check-circle-bold",
      bg: "bg-green-100 dark:bg-green-950",
      textColor: "text-green-600",
    },
    {
      label: "Ditolak",
      value: data.status.REJECTED,
      icon: "solar:close-circle-bold",
      bg: "bg-red-100 dark:bg-red-950",
      textColor: "text-red-600",
    },
  ];

  const metricCards = [
    {
      title: "Total Views",
      value: data.totalViews,
      icon: "solar:eye-bold",
      color: "text-blue-500",
      description: "Seluruh artikel Anda",
    },
    {
      title: "Total Likes",
      value: data.totalLikes,
      icon: "solar:heart-bold",
      color: "text-red-500",
      description: "Seluruh artikel Anda",
    },
    {
      title: "Total Comments",
      value: data.totalComments,
      icon: "solar:chat-round-bold",
      color: "text-green-500",
      description: "Seluruh artikel Anda",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {statusCards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.label}</CardTitle>
              <div className={`rounded-full p-1.5 ${card.bg}`}>
                <Icon icon={card.icon} className={`h-4 w-4 ${card.textColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">Artikel</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {metricCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <Icon icon={card.icon} className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}