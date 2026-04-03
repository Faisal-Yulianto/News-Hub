// app/api/admin/analytics/insights/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helper";
import {
  getIdentifier,
  checkRateLimit,
  adminNewsReadLimiter,
} from "@/lib/rate-limit";

async function getEngagementMetrics(days: number) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [totalLikes, totalComments] = await Promise.all([
    prisma.news.aggregate({
      where: {
        createdAt: { gte: since },
        status: "PUBLISHED",
      },
      _sum: { likeCount: true },
    }),
    prisma.comment.count({
      where: { createdAt: { gte: since } },
    }),
  ]);

  return {
    totalLikes: totalLikes._sum.likeCount ?? 0,
    totalComments,
  };
}

async function getTopArticles(days: number, limit = 5) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  return await prisma.news.findMany({
    where: {
      publishedAt: { gte: since },
      status: "PUBLISHED",
    },
    select: {
      id: true,
      title: true,
      slug: true,
      views: true,
      likeCount: true,
      commentCount: true,
      category: {
        select: { name: true, slug: true },
      },
      author: {
        select: { name: true },
      },
    },
    orderBy: { views: "desc" },
    take: limit,
  });
}

async function getCategoryPerformance(days: number) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const categories = await prisma.category.findMany({
    where: {
      news: {
        some: {
          publishedAt: { gte: since },
          status: "PUBLISHED",
        },
      },
    },
    select: {
      name: true,
      slug: true,
      news: {
        where: {
          publishedAt: { gte: since },
          status: "PUBLISHED",
        },
        select: {
          views: true,
          likeCount: true,
        },
      },
    },
  });

  return categories
    .map((cat) => ({
      name: cat.name,
      slug: cat.slug,
      articleCount: cat.news.length,
      totalViews: cat.news.reduce((sum, article) => sum + article.views, 0),
      totalLikes: cat.news.reduce((sum, article) => sum + article.likeCount, 0),
      avgViewsPerArticle:
        cat.news.length > 0
          ? cat.news.reduce((sum, article) => sum + article.views, 0) /
            cat.news.length
          : 0,
    }))
    .sort((a, b) => b.totalViews - a.totalViews)
    .slice(0, 10);
}

async function getAuthorPerformance(days: number, limit = 5) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const authors = await prisma.user.findMany({
    where: {
      role: "AUTHOR",
      news: {
        some: {
          publishedAt: { gte: since },
          status: "PUBLISHED",
        },
      },
    },
    select: {
      name: true,
      avatar: true,
      news: {
        where: {
          publishedAt: { gte: since },
          status: "PUBLISHED",
        },
        select: {
          views: true,
          likeCount: true,
          id: true,
        },
      },
    },
    take: limit,
  });

  return authors
    .map((author) => ({
      name: author.name ?? "Unknown",
      avatar: author.avatar,
      articleCount: author.news.length,
      totalViews: author.news.reduce((sum, article) => sum + article.views, 0),
      totalLikes: author.news.reduce(
        (sum, article) => sum + article.likeCount,
        0,
      ),
      avgViewsPerArticle:
        author.news.length > 0
          ? author.news.reduce((sum, article) => sum + article.views, 0) /
            author.news.length
          : 0,
    }))
    .sort((a, b) => b.totalViews - a.totalViews);
}
async function getRecentActivities(limit = 10) {
  const [recentNews, recentComments, recentLikes] = await Promise.all([
    prisma.news.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        publishedAt: true,
        author: { select: { name: true, avatar: true } },
      },
    }),
    prisma.comment.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        news: { select: { id: true, title: true, slug: true } },
        user: { select: { name: true, avatar: true } },
      },
    }),
    prisma.newsLike.findMany({
      where: { isLike: true },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        news: { select: { id: true, title: true, slug: true } },
        user: { select: { name: true, avatar: true } },
      },
    }),
  ]);

  const activities = [
    ...recentNews.map((n) => ({
      id: `news-${n.id}`,
      type: "PUBLISH" as const,
      message: `${n.author.name} menerbitkan artikel "${n.title}"`,
      link: `/admin/news/${n.id}`,
      timestamp: n.publishedAt!,
      user: { name: n.author.name, avatar: n.author.avatar },
    })),
    ...recentComments.map((c) => ({
      id: `comment-${c.id}`,
      type: "COMMENT" as const,
      message: `${c.user.name} mengomentari "${c.news.title}"`,
      link: `/admin/news/${c.news.id}`,
      timestamp: c.createdAt,
      user: { name: c.user.name, avatar: c.user.avatar },
    })),
    ...recentLikes.map((l) => ({
      id: `like-${l.id}`,
      type: "LIKE" as const,
      message: `${l.user.name} menyukai artikel "${l.news.title}"`,
      link: `/admin/news/${l.news.id}`,
      timestamp: l.createdAt,
      user: { name: l.user.name, avatar: l.user.avatar },
    })),
  ];

  return activities
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
}

async function getUserBreakdown(days: number) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [loginVisits, nonLoginVisits] = await Promise.all([
    prisma.pageVisit.count({
      where: {
        createdAt: { gte: since },
        userId: { not: null },
      },
    }),
    prisma.pageVisit.count({
      where: {
        createdAt: { gte: since },
        userId: null,
      },
    }),
  ]);

  const total = loginVisits + nonLoginVisits;

  return {
    loginVisits,
    nonLoginVisits,
    totalVisits: total,
    loginPercentage: total === 0 ? 0 : (loginVisits / total) * 100,
    nonLoginPercentage: total === 0 ? 0 : (nonLoginVisits / total) * 100,
  };
}

export async function GET(req: Request) {
  try {
    const user = await requireAuth();
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const identifier = getIdentifier(req);
    const rate = await checkRateLimit(adminNewsReadLimiter, identifier);
    if (!rate.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const url = new URL(req.url);
    const days = parseInt(url.searchParams.get("days") || "30");
    const limit = parseInt(url.searchParams.get("limit") || "5");

    const [
      engagement,
      topArticles,
      categoryPerformance,
      authorPerformance,
      recentActivities,
      userBreakdown,
    ] = await Promise.all([
      getEngagementMetrics(days),
      getTopArticles(days, limit),
      getCategoryPerformance(days),
      getAuthorPerformance(days, limit),
      getRecentActivities(10),
      getUserBreakdown(days),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        engagement,
        topArticles,
        categoryPerformance,
        authorPerformance,
        recentActivities,
        userBreakdown,
        meta: {
          days,
          limit,
          fetchedAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Insights API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch insights data" },
      { status: 500 },
    );
  }
}
