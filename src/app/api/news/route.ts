import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const MAX_LIMIT = 50;
  const page = Math.max(Number(searchParams.get("page") || 1), 1);
  const limit = Math.min(
    Math.max(Number(searchParams.get("limit") || 10), 1),
    MAX_LIMIT
  );
  const skip = (page - 1) * limit;

  let News;

  switch (type) {
    case "trending":
      News = await prisma.news.findMany({
        where: {
          status: "PUBLISHED",
          publishedAt: {
            gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          },
        },
        select: {
          id: true,
          title: true,
          slug: true,
          thumbnailUrl: true,
          views: true,
          excerpt: true,
          publishedAt: true,
          author: { select: { name: true } },
        },
        orderBy: { views: "desc" },
        take: 10,
      });
      return NextResponse.json({ data: News });

    case "populer":
      News = await prisma.news.findMany({
        where: { status: "PUBLISHED" },
        select: {
          id: true,
          title: true,
          slug: true,
          thumbnailUrl: true,
          views: true,
          likeCount: true,
          excerpt: true,
          publishedAt: true,
          author: { select: { name: true } },
        },
        orderBy: { likeCount: "desc" },
        take: 10,
      });
      return NextResponse.json({ data: News });

    case "breaking":
      News = await prisma.news.findMany({
        where: { status: "PUBLISHED", isBreaking: true },
        select: {
          id: true,
          title: true,
          slug: true,
          thumbnailUrl: true,
          views: true,
          excerpt: true,
          publishedAt: true,
          author: { select: { name: true } },
        },
        orderBy: { publishedAt: "desc" },
        take: 20,
      });
      return NextResponse.json({ data: News });

    default: {
      const [data, total] = await Promise.all([
        prisma.news.findMany({
          where: { status: "PUBLISHED" },
          skip,
          take: limit,
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnailUrl: true,
            views: true,
            excerpt: true,
            publishedAt: true,
            author: { select: { name: true } },
          },
          orderBy: { publishedAt: "desc" },
        }),
        prisma.news.count({
          where: { status: "PUBLISHED" },
        }),
      ]);

      const hasMore = skip + data.length < total;

      return NextResponse.json({
        data,
        page,
        limit,
        total,
        hasMore,
        nextPage: hasMore ? page + 1 : null,
      });
    }
  }
}
