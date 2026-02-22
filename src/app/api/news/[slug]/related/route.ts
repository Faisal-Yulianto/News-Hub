import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json(
        { message: "Slug is required" },
        { status: 400 }
      );
    }

    const currentNews = await prisma.news.findUnique({
      where: { slug },
      select: {
        id: true,
        categoryId: true,
      },
    });

    if (!currentNews) {
      return NextResponse.json({ message: "News not found" }, { status: 404 });
    }

    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - 90);

    const relatedCandidates = await prisma.news.findMany({
      where: {
        categoryId: currentNews.categoryId,
        slug: { not: slug },
        publishedAt: {
          gte: dateLimit,
        },
      },
      orderBy: [{ views: "desc" }, { publishedAt: "desc" }],
      take: 10,
      select: {
        id: true,
        title: true,
        slug: true,
        thumbnailUrl: true,
        excerpt: true,
        publishedAt: true,
        views: true,
        author: { select: { name: true } },
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    const finalRelated = relatedCandidates
      .sort(() => 0.5 - Math.random())
      .slice(0, 6);

    return NextResponse.json({
      data: finalRelated,
      total: finalRelated.length,
    });
  } catch (error) {
    console.error("RELATED_NEWS_ERROR:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
