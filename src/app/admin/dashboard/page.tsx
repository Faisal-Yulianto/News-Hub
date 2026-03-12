import { CardOverview } from "@/components/admin/card-overview";
import { DailyAnalyticsChart } from "@/components/admin/daily-chart";
import { TopPagesChart } from "@/components/admin/top-pages-chart";
import { Icon } from "@iconify/react";

export default function DashboardPage() {
  return (
    <main className="flex flex-col gap-y-2">
      <div className="flex items-center pb-4 px-2 gap-x-2">
        <Icon icon="ix:dashboard-filled" className="text-3xl" />
        <h1 className="text-2xl font-bold">
          Selamat Datang di Dashboard, Administrator
        </h1>
      </div>
      <CardOverview />
      <DailyAnalyticsChart />
      <TopPagesChart />
    </main>
  );
}
