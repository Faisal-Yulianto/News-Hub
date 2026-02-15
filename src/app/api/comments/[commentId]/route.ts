import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, getClientIp } from "@/lib/auth-helper";
import {
  bookmarkToggleLimiter,
  getRateLimitHeaders,
} from "@/lib/rate-limit";
import { errorResponse, handleApiEror } from "@/lib/api-helper";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: currentUser.id },
      include: { news: true },
      orderBy: { savedAt: "desc" },
    });

    return NextResponse.json(
      {
        success: true,
        bookmarks,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiEror(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    const identifier = currentUser.id || getClientIp(request);
    const rateLimitResult = await bookmarkToggleLimiter.limit(identifier);

    if (!rateLimitResult.success) {
      const retryAfter = Math.ceil(
        (rateLimitResult.reset - Date.now()) / 1000
      );

      return NextResponse.json(
        {
          error: "Too many bookmark actions. Please try again later.",
          retryAfter,
        },
        {
          status: 429,
          headers: {
            ...getRateLimitHeaders(rateLimitResult),
            "Retry-After": retryAfter.toString(),
          },
        }
      );
    }
    const { newsId } = await request.json();

    if (!newsId) {
      return errorResponse("newsId is required", 400, "VALIDATION_ERROR");
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

      return NextResponse.json(
        {
          success: true,
          bookmarked: false,
          message: "Bookmark dimatikan",
        },
        {
          status: 200,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    await prisma.bookmark.create({
      data: {
        userId: currentUser.id,
        newsId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        bookmarked: true,
        message: "Bookmark diaktifkan",
      },
      {
        status: 200,
        headers: getRateLimitHeaders(rateLimitResult),
      }
    );
  } catch (error) {
    return handleApiEror(error);
  }
}
