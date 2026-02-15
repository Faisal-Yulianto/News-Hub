import { HistoryWithNews } from "./history.query";

export function groupHistoryByTime(histories: HistoryWithNews[]) {
  const now = new Date();

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const last7DaysStart = new Date(todayStart);
  last7DaysStart.setDate(last7DaysStart.getDate() - 7);

  const result = {
    today: [] as HistoryWithNews[],
    yesterday: [] as HistoryWithNews[],
    last7Days: [] as HistoryWithNews[],
    older: [] as HistoryWithNews[],
  };

  for (const h of histories) {
    const viewedAt = h.lastViewedAt;

    if (viewedAt >= todayStart) {
      result.today.push(h);
    } else if (viewedAt >= yesterdayStart) {
      result.yesterday.push(h);
    } else if (viewedAt >= last7DaysStart) {
      result.last7Days.push(h);
    } else {
      result.older.push(h);
    }
  }

  return result;
}
