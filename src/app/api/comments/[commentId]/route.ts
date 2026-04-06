import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, getClientIp } from "@/lib/auth-helper";
import {
  updateCommentLimiter,
  deleteCommentLimiter,
  getRateLimitHeaders,
} from "@/lib/rate-limit";
import { errorResponse, handleApiEror } from "@/lib/api-helper";


export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> },
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    const { commentId } = await params;
    const { content } = await request.json();

    if (!content || content.trim() === "") {
      return errorResponse("Content is required", 400, "VALIDATION_ERROR");
    }

    const identifier = currentUser.id || getClientIp(request);
    const rateLimitResult = await updateCommentLimiter.limit(identifier);
    if (!rateLimitResult.success) {
      const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: "Too many edit requests. Please try again later.",
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

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { news: true },
    });

    if (!comment) {
      return errorResponse("Comment not found", 404, "NOT_FOUND");
    }

    if (comment.deletedAt) {
      return errorResponse(
        "Cannot edit a deleted comment",
        400,
        "ALREADY_DELETED",
      );
    }

    const isCommentOwner = comment.userId === currentUser.id;

    if (!isCommentOwner) {
      return errorResponse("Forbidden", 403, "FORBIDDEN");
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        content: content.trim(),
        isEdited: true,
      },
    });

    return NextResponse.json(
      { success: true, comment: updatedComment },
      { status: 200, headers: getRateLimitHeaders(rateLimitResult) },
    );
  } catch (error) {
    return handleApiEror(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    const { commentId } = await params;

    const identifier = currentUser.id || getClientIp(request);
    const rateLimitResult = await deleteCommentLimiter.limit(identifier);
    if (!rateLimitResult.success) {
      const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000);
      return NextResponse.json(
        { error: "Too many delete requests. Please try again later.", retryAfter },
        { status: 429, headers: { ...getRateLimitHeaders(rateLimitResult), "Retry-After": retryAfter.toString() } }
      );
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        news: { select: { authorId: true } }, 
        parent: { select: { id: true } },     
      },
    });

    if (!comment) {
      return errorResponse("Comment not found", 404, "NOT_FOUND");
    }

    if (comment.deletedAt) {
      return errorResponse("Comment already deleted", 400, "ALREADY_DELETED");
    }

    const isCommentOwner = comment.userId === currentUser.id;
    const isNewsOwner = comment.news.authorId === currentUser.id;
    if (!isCommentOwner && !isNewsOwner) {
      return errorResponse("Forbidden", 403, "FORBIDDEN");
    }

    await prisma.$transaction(async (tx) => {
      await tx.comment.update({
        where: { id: commentId },
        data: { deletedAt: new Date() },
      });

      await tx.news.update({
        where: { id: comment.newsId },
        data: { commentCount: { decrement: 1 } },
      });

      if (comment.parentId) {
        await tx.comment.update({
          where: { id: comment.parentId },
          data: { replyCount: { decrement: 1 } },
        });
      }
    });

    return NextResponse.json(
      { success: true, message: "Comment deleted successfully" },
      { status: 200, headers: getRateLimitHeaders(rateLimitResult) }
    );
  } catch (error) {
    return handleApiEror(error);
  }
}