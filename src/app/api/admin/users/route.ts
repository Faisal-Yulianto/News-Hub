import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  checkRateLimit,
  adminUserReadLimiter,
  getIdentifier,
  getRateLimitHeaders,
} from "@/lib/rate-limit";
import { handleApiEror, succesResponse } from "@/lib/api-helper";
import { Role } from "@prisma/client";

const VALID_ROLES = ["ALL", "READER", "AUTHOR"] as const;
const DEFAULT_LIMIT = 20;

export async function GET(req: Request) {
  try {
    const identifier = getIdentifier(req);
    const rate = await checkRateLimit(adminUserReadLimiter, identifier);
    if (!rate.success) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: getRateLimitHeaders(rate) },
      );
    }
    const { searchParams } = new URL(req.url);
    const roleParam = searchParams.get("role")?.toUpperCase() ?? "ALL";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const rawSearch = searchParams.get("search")?.trim() ?? "";
    if (!VALID_ROLES.includes(roleParam as (typeof VALID_ROLES)[number])) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    const sanitizedSearch = rawSearch
      .slice(0, 100)
      .replace(/[^a-zA-Z0-9\s\-.,]/g, "");

    const skip = (page - 1) * DEFAULT_LIMIT;
    const where = {
      NOT: { role: "ADMIN" as Role },
      ...(roleParam !== "ALL" && { role: roleParam as Role }),
      ...(sanitizedSearch && {
        name: { contains: sanitizedSearch, mode: "insensitive" as const },
      }),
    };
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: DEFAULT_LIMIT,
      }),
      prisma.user.count({ where }),
    ]);

    return succesResponse({
      data: users,
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
