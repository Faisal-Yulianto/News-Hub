import { NextResponse,NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helper";
import { handleApiEror } from "@/lib/api-helper";
import { historyCreateLimiter,historyReadLimiter,getRateLimitHeaders } from "@/lib/rate-limit";
import { groupHistoryByTime } from "@/lib/history-by-time";
import { historyWithNewsArgs } from "@/lib/history.query";
import { historyClearLimiter } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = await historyCreateLimiter.limit(user.id);
  if (!rateLimit.success) {
    return NextResponse.json(
      { message: "Too many requests" },
      {
        status: 429,
        headers: {
          "Retry-After": rateLimit.reset.toString(),
        },
      },
    );
  }

  const { newsId } = await req.json();
  if (!newsId) {
    return NextResponse.json({ message: "newsId required" }, { status: 400 });
  }

  await prisma.history.upsert({
    where: {
      userId_newsId: {
        userId: user.id,
        newsId,
      },
    },
    update: {
      lastViewedAt: new Date(),
    },
    create: {
      userId: user.id,
      newsId,
    },
  });

  return NextResponse.json({ success: true });
}

const PAGE_SIZE = 10;

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = await historyReadLimiter.limit(user.id);
  if (!rateLimit.success) {
    return NextResponse.json(
      { message: "Too many requests" },
      { status: 429 },
    );
  }

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const anchorParam = searchParams.get("anchor");

  let anchor: Date;

if (anchorParam) {
  anchor = new Date(anchorParam);
} else {
  anchor = new Date(); 
}

 const histories = await prisma.history.findMany({
  ...historyWithNewsArgs,
 where: {
  userId: user.id,
  lastViewedAt: {
    lte: new Date(anchor),
  },
},

  take: PAGE_SIZE + 1,
  ...(cursor && {
    skip: 1,
    cursor: { id: cursor },
  }),
  orderBy: [
    { lastViewedAt: "desc" },
    { id: "desc" },
  ],
});


 let nextCursor: string | null = null;

if (histories.length > PAGE_SIZE) {
  const nextItem = histories.pop();
  nextCursor = nextItem!.id; 
}

const responseAnchor =
  anchorParam ?? histories[0]?.lastViewedAt.toISOString() ?? null;

  return NextResponse.json({
    data: groupHistoryByTime(histories),
    responseAnchor,
    nextCursor,
  });
}

export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const rateLimitResult = await historyClearLimiter.limit(currentUser.id);

    if (!rateLimitResult.success) {
      const retryAfter = Math.ceil(
        (rateLimitResult.reset - Date.now()) / 1000
      );

      return NextResponse.json(
        {
          error: "Too many requests. Try again later.",
          retryAfter,
        },
        {
          status: 429,
          headers: {
            ...getRateLimitHeaders(rateLimitResult),
            "Retry-After": retryAfter.toString(),
          },
        }
      );
    }

    await prisma.history.deleteMany({
      where: {
        userId: currentUser.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "All history cleared",
      },
      {
        status: 200,
        headers: getRateLimitHeaders(rateLimitResult),
      }
    );
  } catch (error) {
    return handleApiEror(error);
  }
}