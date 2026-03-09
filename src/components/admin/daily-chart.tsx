"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import { useAnalyticsDaily } from "@/hooks/admin/use-analytics-daily";
import { Icon } from "@iconify/react";

const chartConfig = {
  total: {
    label: "Total Pengunjung",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

function formatXAxis(dateStr: string): string {
  const date = new Date(dateStr);
  const day = date.toLocaleDateString("id-ID", { weekday: "short" });
  const num = date.getDate().toString().padStart(2, "0");
  return `${day.charAt(0).toUpperCase() + day.slice(1)}, ${num}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;

  const { date, total } = payload[0].payload;

  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-md text-sm">
      <p className="font-medium text-foreground mb-1">
        {new Date(date).toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>
      <div className="flex items-center justify-between gap-4">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: "var(--color-total)" }}
          />
          Total aktivitas Pengunjung
        </span>
        <span className="font-semibold text-foreground">{total}</span>
      </div>
    </div>
  );
}

export function DailyAnalyticsChart() {
  const { data, isLoading, isError } = useAnalyticsDaily();
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-5 w-40 animate-pulse rounded bg-muted" />
          <div className="h-4 w-56 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    );
  }
  if (isError || !data) {
    return (
      <Card>
        <CardContent className="flex h-[250px] items-center justify-center">
          <p className="text-sm text-destructive">Gagal memuat data grafik</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex items-center gap-1">
            <Icon icon="streamline-ultimate:time-daily-1-bold" />
            <h1>Tren Harian</h1>
          </div>
        </CardTitle>
        <CardDescription>Total aktivitas Pengunjung per hari</CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:px-6 ">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={data}>
            <defs>
              <linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-total)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-total)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              padding={{ left: 20, right: 20 }}
              tickFormatter={formatXAxis}
            />
            <ChartTooltip cursor={false} content={<CustomTooltip />} />
            <Area
              dataKey="total"
              type="natural"
              fill="url(#fillTotal)"
              stroke="var(--color-total)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
