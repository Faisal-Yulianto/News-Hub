import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  checkRateLimit,
  adminNewsReadLimiter,
  getIdentifier,
  getRateLimitHeaders,
} from "@/lib/rate-limit";
import { handleApiEror, succesResponse } from "@/lib/api-helper";
import { NewsStatus } from "@prisma/client";

const VALID_STATUSES = [
  "PENDING_REVIEW",
  "PUBLISHED",
  "REJECTED",
  "ALL",
] as const;
const DEFAULT_LIMIT = 20;

export async function GET(req: Request) {
  try {
    const identifier = getIdentifier(req);
    const rate = await checkRateLimit(adminNewsReadLimiter, identifier);
    if (!rate.success) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: getRateLimitHeaders(rate) },
      );
    }
    const { searchParams } = new URL(req.url);
    const statusParam =
      searchParams.get("status")?.toUpperCase() ?? "PENDING_REVIEW";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const search = searchParams.get("search")?.trim() ?? "";
    const sanitizedSearch = search
      .slice(0, 100)
      .replace(/[^a-zA-Z0-9\s\-.,]/g, "");
    if (
      !VALID_STATUSES.includes(statusParam as (typeof VALID_STATUSES)[number])
    ) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const skip = (page - 1) * DEFAULT_LIMIT;
    const where = {
      ...(statusParam !== "ALL" && { status: statusParam as NewsStatus }),
      ...(sanitizedSearch && {
        title: { contains: sanitizedSearch, mode: "insensitive" as const },
      }),
    };
    const [news, total] = await Promise.all([
      prisma.news.findMany({
        where,
        select: {
          id: true,
          title: true,
          status: true,
          isBreaking: true,
          publishedAt: true,
          createdAt: true,
          author: {
            select: { name: true, avatar: true },
          },
          category: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: "asc" },
        skip,
        take: DEFAULT_LIMIT,
      }),
      prisma.news.count({ where }),
    ]);

    return succesResponse({
      data: news,
      pagination: {
        total,
        page,
        limit: DEFAULT_LIMIT,
        totalPages: Math.ceil(total / DEFAULT_LIMIT),
      },
    });
  } catch (error) {
    return handleApiEror(error);
  }
}
