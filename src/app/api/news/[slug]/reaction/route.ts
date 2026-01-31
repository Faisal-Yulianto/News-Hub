import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await req.json();
    const { type } = body;

    if (type !== "like" && type !== "dislike") {
      return NextResponse.json(
        { message: "Invalid reaction type" },
        { status: 400 }
      );
    }

    const isLike = type === "like";

    const news = await prisma.news.findUnique({
      where: { slug: params.slug },
      select: { id: true },
    });

    if (!news) {
      return NextResponse.json({ message: "News not found" }, { status: 404 });
    }

    const newsId = news.id;

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.newsLike.findUnique({
        where: {
          userId_newsId: {
            userId,
            newsId,
          },
        },
      });

      if (!existing) {
        await tx.newsLike.create({
          data: { userId, newsId, isLike },
        });

        await tx.news.update({
          where: { id: newsId },
          data: isLike
            ? { likeCount: { increment: 1 } }
            : { disLike: { increment: 1 } },
        });

        return { state: isLike ? "like" : "dislike" };
      }

      if (existing.isLike === isLike) {
        await tx.newsLike.delete({
          where: { id: existing.id },
        });

        await tx.news.update({
          where: { id: newsId },
          data: isLike
            ? { likeCount: { decrement: 1 } }
            : { disLike: { decrement: 1 } },
        });

        return { state: "neutral" };
      }

      await tx.newsLike.update({
        where: { id: existing.id },
        data: { isLike },
      });

      await tx.news.update({
        where: { id: newsId },
        data: isLike
          ? {
              likeCount: { increment: 1 },
              disLike: { decrement: 1 },
            }
          : {
              likeCount: { decrement: 1 },
              disLike: { increment: 1 },
            },
      });

      return { state: isLike ? "like" : "dislike" };
    });

    return NextResponse.json({
      success: true,
      userReaction: result.state === "neutral" ? null : result.state,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
