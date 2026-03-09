"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
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
import { useAnalyticsTopPages } from "@/hooks/admin/use-analytics-top-pages";
import { Icon } from "@iconify/react";

const chartConfig = {
  total: {
    label: "Total Pengunjung",
    color: "var(--chart-1)",
  },
  label: {
    color: "var(--background)",
  },
} satisfies ChartConfig;

function truncatePath(path: string): string {
  const segments = path.split("/").filter(Boolean);
  if (segments.length <= 1) return path;
  return `/${segments[0]}/...`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;

  const { page, total } = payload[0].payload;

  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-md text-sm">
      <p className="font-medium text-foreground mb-1 break-all max-w-[200px]">
        {page}
      </p>
      <div className="flex items-center justify-between gap-4">
        <div className="w-4 h-4 bg-blue-600" />
        <span className="text-muted-foreground">Total Pengunjung</span>
        <span className="font-semibold text-foreground">{total}</span>
      </div>
    </div>
  );
}

export function TopPagesChart() {
  const { data, isLoading, isError } = useAnalyticsTopPages();
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
          <p className="text-sm text-destructive">Gagal memuat data halaman</p>
        </CardContent>
      </Card>
    );
  }
  const chartData = data.map((item) => ({
    ...item,
    label: truncatePath(item.page),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex items-center gap-1">
            <Icon icon="fluent:arrow-trending-lines-20-filled" />
            <h1>Halaman Terpopuler</h1>
          </div>
        </CardTitle>
        <CardDescription>Halaman dengan pengunjung terbanyak</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="w-full"
          style={{ height: `${chartData.length * 48}px` }}
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{ right: 40, left: 100 }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="page"
              type="category"
              tickLine={false}
              axisLine={false}
              hide
            />
            <XAxis dataKey="total" type="number" hide />
            <ChartTooltip cursor={false} content={<CustomTooltip />} />

            <Bar
              dataKey="total"
              layout="vertical"
              fill="var(--color-total)"
              radius={4}
            >
              <LabelList
                dataKey="label"
                position="left"
                offset={8}
                className="fill-foreground"
                fontSize={12}
              />
              <LabelList
                dataKey="total"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
