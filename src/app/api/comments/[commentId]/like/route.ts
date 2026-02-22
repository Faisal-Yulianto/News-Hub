import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helper";
import { likeLimiter, getRateLimitHeaders } from "@/lib/rate-limit";
import { validationCommentExists } from "@/lib/validation/comments-validtion";
import { errorResponse, handleApiEror } from "@/lib/api-helper";

export async function POST(
  request: NextRequest,
  { params }: { params: { commentId: string } },
) {
  try { 
    const { commentId } = params;
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }
    const rateLimitResult = await likeLimiter.limit(currentUser.id);
    if (!rateLimitResult.success) {
      const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: `Too many requests. you can like ${rateLimitResult.limit} times per minute. Try again in ${retryAfter} seconds`,
          retryAfter,
          limit: rateLimitResult.limit,
          remaining: rateLimitResult.remaining,
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
    const comment = await validationCommentExists(commentId);

    if (!comment) {
      return errorResponse("Comment not found", 404, "NOT_FOUND");
    }
    if (comment.deletedAt) {
      return errorResponse(
        "Cannot like deleted comment",
        400,
        "COMMENT_DELETED",
      );
    }
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId: currentUser.id,
          commentId: commentId,
        },
      },
    });
    let action: "liked" | "unliked";
    let newLikeCount: number;

    return await prisma.$transaction(async (tx) => {
      if (existingLike) {
        await tx.commentLike.delete({
          where: {
            id: existingLike.id,
          },
        });
        const updateComment = await tx.comment.update({
          where: { id: commentId },
          data: {
            likeCount: {
              decrement: 1,
            },
          },
          select: {
            likeCount: true,
          },
        });
        action = "unliked";
        newLikeCount = updateComment.likeCount;
      } else {
        await tx.commentLike.create({
          data: {
            userId: currentUser.id,
            commentId: commentId,
          },
        });
        const updateComment = await tx.comment.update({
          where: { id: commentId },
          data: {
            likeCount: {
              increment: 1,
            },
          },
          select: {
            likeCount: true,
          },
        });
        action = "liked";
        newLikeCount = updateComment.likeCount;
      }

      return NextResponse.json(
        {
          success: true,
          action,
          likeCount: newLikeCount,
          isLiked: action === "liked",
        },
        {
          status: 200,
          headers: getRateLimitHeaders(rateLimitResult),
        },
      );
    });
  } catch (error) {
    return handleApiEror(error);
  }
}
