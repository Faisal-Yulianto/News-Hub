import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  try {
    switch (type) {
      case "news": {
        const news = await prisma.news.findMany({
          where: { status: "PUBLISHED" },
          select: {
            slug: true,
            updatedAt: true,
          },
          orderBy: { updatedAt: "desc" },
        });
        return NextResponse.json({ data: news });
      }

      case "categories": {
        const categories = await prisma.category.findMany({
          where: { slug: { not: null } },
          select: { slug: true },
        });
        return NextResponse.json({ data: categories });
      }

      default:
        return NextResponse.json(
          { error: "Invalid type" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Sitemap API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sitemap data" },
      { status: 500 }
    );
  }
}