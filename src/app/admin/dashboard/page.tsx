import { CardOverview } from "@/components/admin/card-overview";
import { DailyAnalyticsChart } from "@/components/admin/daily-chart";
import { TopPagesChart } from "@/components/admin/top-pages-chart";

export default function DashboardPage() {
  return (
    <main className="flex flex-col gap-y-2">
      <CardOverview />
      <DailyAnalyticsChart />
      <TopPagesChart />
    </main>
  );
}
