"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnalyticsOverview } from "@/hooks/admin/use-analytics-overview";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

function formatNumber(num: number): string {
  return num.toLocaleString("id-ID");
}

function formatChange(change: number) {
  if (change === 0) {
    return {
      label: "0%",
      icon: <Minus className="h-4 w-4" />,
      className: "text-muted-foreground",
    };
  }
  if (change > 0) {
    return {
      label: `+${change.toFixed(1)}%`,
      icon: <TrendingUp className="h-4 w-4" />,
      className: "text-green-500",
    };
  }
  return {
    label: `${change.toFixed(1)}%`,
    icon: <TrendingDown className="h-4 w-4" />,
    className: "text-red-500",
  };
}

export function CardOverview() {
  const { data, isLoading, isError } = useAnalyticsOverview();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 w-32 rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-20 rounded bg-muted" />
              <div className="mt-2 h-4 w-24 rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <p className="text-sm text-destructive">Gagal memuat data</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const changeToday = formatChange(data.changeToday);
  const change7 = formatChange(data.change7Days);
  const change30 = formatChange(data.change30Days);

  const cards = [
    {
      title: "Pengunjung Hari Ini",
      value: formatNumber(data.today),
      change: changeToday,
      compareLabel: "dibanding kemarin",
    },
    {
      title: "Pengunjung 1 Minggu Terakhir",
      value: formatNumber(data.last7Days),
      change: change7,
      compareLabel: "dari minggu sebelumnya",
    },
    {
      title: "Pengunjung 1 Bulan Terakhir",
      value: formatNumber(data.last30Days),
      change: change30,
      compareLabel: "dari bulan sebelumnya",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader >
            <CardTitle className="text-sm font-medium text-muted-foreground text-center">
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center pb-5">{card.value}</p>
            <div
              className={`mt-2 flex items-center gap-1 text-sm justify-center ${card.change.className}`}
            >
              {card.change.icon}
              <span>{card.change.label}</span>
              <span className="text-muted-foreground">{card.compareLabel}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}