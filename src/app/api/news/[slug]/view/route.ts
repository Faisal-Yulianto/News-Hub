import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const slug = params.slug;

  try {
    await prisma.$transaction(async (tx) => {
      const news = await tx.news.findUnique({
        where: { slug },
        select: { id: true },
      });

      if (!news) {
        throw new Error("News not found");
      }

      const alreadyViewed = await tx.viewLog.findFirst({
        where: {
          userId,
          newsId: news.id,
        },
      });

      if (alreadyViewed) return;

      await tx.viewLog.create({
        data: {
          userId,
          newsId: news.id,
        },
      });

      await tx.news.update({
        where: { id: news.id },
        data: { views: { increment: 1 } },
      });
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
