import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const news = await prisma.news.findUnique({
    where: { slug: params.slug },
    include: {
      contentImages: true,
      author: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
      newsLikes: userId
        ? {
            where: { userId },
            select: { isLike: true },
          }
        : false,
      comment: true,
    },
  });

  if (!news || !news.publishedAt || news.publishedAt > new Date()) {
    return NextResponse.json({ message: "News not found" }, { status: 404 });
  }

  let userReaction: "like" | "dislike" | null = null;

  if (news.newsLikes && news.newsLikes.length > 0) {
    userReaction = news.newsLikes[0].isLike ? "like" : "dislike";
  }

  return NextResponse.json({
    ...news,
    userReaction,
    newsLikes: undefined,
  });
}