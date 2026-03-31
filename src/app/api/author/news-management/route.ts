import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleApiEror, succesResponse } from "@/lib/api-helper";
import { requireAuth } from "@/lib/auth-helper";
import {
  checkRateLimit,
  getRateLimitHeaders,
  getIdentifier,
  authorNewsReadLimiter,
} from "@/lib/rate-limit";
import { NewsStatus, Prisma } from "@prisma/client";

const ALLOWED_STATUSES = [
  NewsStatus.DRAFT,
  NewsStatus.PENDING_REVIEW,
  NewsStatus.PUBLISHED,
  NewsStatus.REJECTED,
] as const;

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    if (user.role !== "AUTHOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const identifier = getIdentifier(req);
    const rateLimitResult = await checkRateLimit(
      authorNewsReadLimiter,
      identifier,
    );
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) },
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") ?? "ALL";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = 20;
    const search = searchParams.get("search")?.trim() ?? "";
    const where: Prisma.NewsWhereInput = {
      authorId: user.id,
      status: { notIn: [NewsStatus.ARCHIVED] },
    };
    function isAllowedStatus(
      status: string,
    ): status is (typeof ALLOWED_STATUSES)[number] {
      return ALLOWED_STATUSES.includes(
        status as (typeof ALLOWED_STATUSES)[number],
      );
    }

    if (status !== "ALL" && isAllowedStatus(status)) {
      where.status = status;
    }
    if (search) {
      where.title = { contains: search, mode: "insensitive" };
    }

    const [total, news] = await prisma.$transaction([
      prisma.news.count({ where }),
      prisma.news.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          isBreaking: true,
          rejectionReason: true,
          createdAt: true,
          publishedAt: true,
          category: {
            select: { id: true, name: true, icon: true },
          },
        },
      }),
    ]);

    return succesResponse({
      data: news,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiEror(error);
  }
}
