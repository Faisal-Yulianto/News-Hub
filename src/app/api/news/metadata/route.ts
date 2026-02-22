import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const latestBreaking = await prisma.news.findFirst({
      where: {
        status: "PUBLISHED",
        isBreaking: true,
      },
      select: {
        title: true,
        excerpt: true,
        thumbnailUrl: true,
        publishedAt: true,
        slug: true,
      },
      orderBy: {
        publishedAt: "desc",
      },
    });

    const totalNews = await prisma.news.count({
      where: { status: "PUBLISHED" },
    });

    return NextResponse.json({
      latestBreaking,
      totalNews,
    });
  } catch (error) {
    console.error("Metadata API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch metadata" },
      { status: 500 }
    );
  }
}