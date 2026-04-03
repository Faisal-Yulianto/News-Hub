import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helper";
import {
  getIdentifier,
  checkRateLimit,
  authorDashboardLimiter,
} from "@/lib/rate-limit";

async function getAuthorOverview(authorId: string) {
  const [statusCount, stats] = await Promise.all([
    prisma.news.groupBy({
      by: ["status"],
      where: { authorId },
      _count: { id: true },
    }),
    prisma.news.aggregate({
      where: { authorId },
      _sum: {
        views: true,
        likeCount: true,
        commentCount: true,
      },
    }),
  ]);

  const statusMap: Record<string, number> = {
    DRAFT: 0,
    PENDING_REVIEW: 0,
    PUBLISHED: 0,
    REJECTED: 0,
  };

  statusCount.forEach((item) => {
    statusMap[item.status] = item._count.id;
  });

  return {
    totalArticles: Object.values(statusMap).reduce((a, b) => a + b, 0),
    status: statusMap,
    totalViews: stats._sum.views ?? 0,
    totalLikes: stats._sum.likeCount ?? 0,
    totalComments: stats._sum.commentCount ?? 0,
  };
}

async function getAuthorTopArticles(authorId: string, limit: number = 5) {
  const articles = await prisma.news.findMany({
    where: { authorId },
    select: {
      id: true,
      title: true,
      slug: true,
      views: true,
      likeCount: true,
      commentCount: true,
      status: true,
      publishedAt: true,
      category: {
        select: { name: true },
      },
    },
    orderBy: { views: "desc" },
    take: limit,
  });

  return articles;
}

async function getAuthorDailyViews(authorId: string, days: number = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const authorArticles = await prisma.news.findMany({
    where: { authorId },
    select: { id: true },
  });

  const articleIds = authorArticles.map((a) => a.id);

  if (articleIds.length === 0) {
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      result.push({
        date: date.toISOString().split("T")[0],
        total: 0,
      });
    }
    return result;
  }

  const views = await prisma.viewLog.groupBy({
    by: ["createdAt"],
    where: {
      newsId: { in: articleIds },
      createdAt: { gte: since },
    },
    _count: { id: true },
  });

  const dailyMap = new Map<string, number>();
  views.forEach((view) => {
    const dateStr = view.createdAt.toISOString().split("T")[0];
    dailyMap.set(dateStr, (dailyMap.get(dateStr) || 0) + view._count.id);
  });

  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    result.push({
      date: dateStr,
      total: dailyMap.get(dateStr) || 0,
    });
  }

  return result;
}

export async function GET(req: Request) {
  try {
    const user = await requireAuth();

    if (user.role !== "AUTHOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const identifier = getIdentifier(req);
    const rate = await checkRateLimit(authorDashboardLimiter, identifier);
    if (!rate.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const url = new URL(req.url);
    const days = parseInt(url.searchParams.get("days") || "30");
    const limit = parseInt(url.searchParams.get("limit") || "5");

    const [overview, topArticles, dailyViews] = await Promise.all([
      getAuthorOverview(user.id),
      getAuthorTopArticles(user.id, limit),
      getAuthorDailyViews(user.id, days),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        overview,
        topArticles,
        dailyViews,
        meta: {
          days,
          limit,
          fetchedAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Author dashboard API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard data" },
      { status: 500 },
    );
  }
}
