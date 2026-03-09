import { prisma } from "@/lib/prisma";

export async function getUniqueVisitors(days: number, offsetDays?: number) {
  const endDate = offsetDays
    ? new Date(Date.now() - offsetDays * 24 * 60 * 60 * 1000)
    : new Date();
  const since = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

  const [loginUsers, nonLoginVisitors] = await Promise.all([
    prisma.pageVisit.groupBy({
      by: ["userId"],
      where: {
        userId: { not: null },
        createdAt: { gte: since, lt: endDate },
      },
    }),
    prisma.pageVisit.groupBy({
      by: ["visitorId"],
      where: {
        userId: null,
        createdAt: { gte: since, lt: endDate },
      },
    }),
  ]);

  return loginUsers.length + nonLoginVisitors.length;
}

export async function getOverviewAnalytics() {
  const [today, yesterday, last7Days, last30Days, prev7Days, prev30Days] =
    await Promise.all([
      getUniqueVisitors(1),
      getUniqueVisitors(1, 1),
      getUniqueVisitors(7),
      getUniqueVisitors(30),
      getUniqueVisitors(14, 7),
      getUniqueVisitors(60, 30),
    ]);

  return {
    today,
    last7Days,
    last30Days,
    changeToday: yesterday === 0 ? 0 : ((today - yesterday) / yesterday) * 100,
    change7Days:
      prev7Days === 0 ? 0 : ((last7Days - prev7Days) / prev7Days) * 100,
    change30Days:
      prev30Days === 0 ? 0 : ((last30Days - prev30Days) / prev30Days) * 100,
  };
}

export async function getDailyVisitors(days: number) {
  const now = new Date();
  const since = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  const result = await prisma.pageVisit.groupBy({
    by: ["visitDate"],
    where: {
      visitDate: {
        gte: since,
        lte: now,
      },
      NOT: { visitDate: null },
    },
    _count: {
      _all: true,
    },
    orderBy: {
      visitDate: "asc",
    },
  });

  return result.map((item) => ({
    date: item.visitDate,
    total: item._count._all,
  }));
}
export async function getTopPages(days: number, limit = 10) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const result = await prisma.pageVisit.groupBy({
    by: ["page"],
    where: {
      createdAt: { gte: since },
    },
    _count: {
      page: true,
    },
    orderBy: {
      _count: {
        page: "desc",
      },
    },
    take: limit,
  });

  return result.map((item) => ({
    page: item.page,
    total: item._count.page,
  }));
}
