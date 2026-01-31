import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getCurrentUser, getClientIp } from "@/lib/auth-helper";
import { commentReadLimiter, getRateLimitHeaders } from "@/lib/rate-limit";
import { errorResponse, handleApiEror } from "@/lib/api-helper";

const batchLikeStatusSchema = z.object({
  commentsIds: z
    .array(z.string())
    .min(1, "At least one comment ID is required")
    .max(100, "Maximum 100 comment IDs allowed"),
});

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    const identifier = currentUser?.id || getClientIp(request);
    const rateLimitResult = await commentReadLimiter.limit(identifier);
    if (!rateLimitResult.success) {
      const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: "Too many requests. please try again later.",
          retryAfter,
        },
        {
          status: 429,
          headers: {
            ...getRateLimitHeaders(rateLimitResult),
            "Retry-After": retryAfter.toString(),
          },
        },
      );
    }
    const body = await request.json();
    const validation = batchLikeStatusSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.message, 400, "VALIDATION_ERROR");
    }
    const { commentsIds } = validation.data;
    if (!currentUser) {
      const likeStatus = Object.fromEntries(
        commentsIds.map((id) => [id, false]),
      );
      return NextResponse.json(
        { likeStatus },
        {
          status: 200,
          headers: getRateLimitHeaders(rateLimitResult),
        },
      );
    }
    const likes = await prisma.commentLike.findMany({
      where: {
        userId: currentUser.id,
        commentId: {
          in: commentsIds,
        },
      },
      select: {
        commentId: true,
      },
    });
    const likedCommentIds = new Set(likes.map((l) => l.commentId));
    const likeStatus = Object.fromEntries(
      commentsIds.map((id) => [id, likedCommentIds.has(id)]),
    );
    return NextResponse.json(
      { likeStatus },
      {
        status: 200,
        headers: getRateLimitHeaders(rateLimitResult),
      },
    );
  } catch (error) {
    return handleApiEror(error);
  }
}
