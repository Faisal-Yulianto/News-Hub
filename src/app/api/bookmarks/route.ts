import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, getClientIp } from "@/lib/auth-helper";
import prisma from "@/lib/prisma";
import { bookmarkToggleLimiter, getRateLimitHeaders } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const limit = Math.min(Number(searchParams.get("limit")) || 10, 20);

    const skip = (page - 1) * limit;

    const [total, bookmarks] = await Promise.all([
      prisma.bookmark.count({
        where: { userId: currentUser.id },
      }),
      prisma.bookmark.findMany({
        where: { userId: currentUser.id },
        include: {
          news: {
            include: {
              author: true,
            },
          },
        },
        orderBy: {
          savedAt: "desc",
        },
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    return NextResponse.json({
      data: bookmarks.map((b) => ({
        id: b.news.id,
        title: b.news.title,
        slug: b.news.slug,
        excerpt: b.news.excerpt,
        thumbnailUrl: b.news.thumbnailUrl,
        publishedAt: b.news.publishedAt,
        views: b.news.views,
        author: {
          name: b.news.author.name ?? "Unknown Author",
        },
      })),
      page,
      limit,
      total,
      hasMore,
      nextPage: hasMore ? page + 1 : null,
    });
  } catch (error) {
    console.error("GET BOOKMARK ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const identifier = currentUser?.id || getClientIp(request);

    const rateLimit = await bookmarkToggleLimiter.limit(identifier);

    if (!rateLimit.success) {
      const retryAfter = Math.ceil((rateLimit.reset - Date.now()) / 1000);

      return NextResponse.json(
        {
          error: "Terlalu banyak aksi bookmark, coba lagi nanti",
          retryAfter,
        },
        {
          status: 429,
          headers: {
            ...getRateLimitHeaders(rateLimit),
            "Retry-After": retryAfter.toString(),
          },
        },
      );
    }

    const { newsId } = await request.json();

    if (!newsId) {
      return NextResponse.json(
        { error: "newsId is required" },
        { status: 400 },
      );
    }

    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_newsId: {
          userId: currentUser.id,
          newsId,
        },
      },
    });

    if (existing) {
      await prisma.bookmark.delete({
        where: {
          userId_newsId: {
            userId: currentUser.id,
            newsId,
          },
        },
      });

      return NextResponse.json({
        success: true,
        bookmarked: false,
        message: "Bookmark dimatikan",
      });
    }

    await prisma.bookmark.create({
      data: {
        userId: currentUser.id,
        newsId,
      },
    });

    return NextResponse.json({
      success: true,
      bookmarked: true,
      message: "Bookmark diaktifkan",
    });
  } catch (error) {
    console.error("PATCH BOOKMARK ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
