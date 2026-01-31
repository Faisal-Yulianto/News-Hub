import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser,getClientIp } from "@/lib/auth-helper";
import { updateCommentLimiter, getRateLimitHeaders,commentReadLimiter } from "@/lib/rate-limit";
import { errorResponse, handleApiEror } from "@/lib/api-helper";
import {
  sanitizeContent,
  updateCommentSchema,
  validationCommentExists,
  paginationSchema
} from "@/lib/validation/comments-validtion";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const newsId = searchParams.get("newsId");
    
    if (!newsId) {
      return errorResponse("News ID is required", 400);
    }

    const currentUser = await getCurrentUser();
    const identifier = currentUser?.id || getClientIp(request);
    const rateLimitResult = await commentReadLimiter.limit(identifier);
    
    if (!rateLimitResult.success) {
      const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000);
      return NextResponse.json(
        { 
          error: "Too many requests. Please try again later.",
          retryAfter,
        },
        { 
          status: 429,
          headers: {
            ...getRateLimitHeaders(rateLimitResult),
            "Retry-After": retryAfter.toString(),
          }
        }
      );
    }

    const paginationResult = paginationSchema.safeParse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
    });

    if (!paginationResult.success) {
      return errorResponse("Invalid pagination parameters", 400);
    }

    const { page, limit } = paginationResult.data;
    const skip = (page - 1) * limit;

    const total = await prisma.comment.count({
      where: {
        newsId,
        parentId: null,
        deletedAt: null,
      },
    });

    const comments = await prisma.comment.findMany({
      where: {
        newsId,
        parentId: null,
        deletedAt: null,
      },
      select: {
        id: true,
        content: true,
        newsId: true,
        userId: true,
        parentId: true,
        depth: true,
        likeCount: true,
        replyCount: true,
        deletedAt: true,
        isEdited: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        news: {
          select: {
            id:true,
            commentCount:true,
          }
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    let likeStatuses: Map<string, boolean> = new Map();
    
    if (currentUser && comments.length > 0) {
      const commentIds = comments.map(c => c.id);

      const likes = await prisma.commentLike.findMany({
        where: {
          userId: currentUser.id,
          commentId: {
            in: commentIds,
          },
        },
        select: {
          commentId: true,
        },
      });

      likeStatuses = new Map(likes.map(l => [l.commentId, true]));
    }
    const formattedComments = comments.map(comment => ({
      ...comment,
      isLikedByCurrentUser: likeStatuses.get(comment.id) || false,
    }));

    return NextResponse.json(
      {
        comments: formattedComments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasMore: skip + limit < total,
        },
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


export async function PATCH(
  request: NextRequest,
  { params }: { params: { commentId: string } },
) {
  try {
    const { commentId } = params;
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }
    const rateLimitResult = await updateCommentLimiter.limit(currentUser.id);
    if (!rateLimitResult.success) {
      const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: `Too many edit requests. Try again in ${retryAfter} seconds.`,
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
    const comment = await validationCommentExists(commentId);
    if (!comment) {
      return errorResponse("Comment not found", 404, "NOT FOUND");
    }
    if (comment.userId !== currentUser.id) {
      return errorResponse(
        "You can only edit your own comments",
        403,
        "FORBIDEN",
      );
    }
    if (comment.deletedAt) {
      return errorResponse(
        "Cannot edit deleted comment",
        400,
        "COMMENT DELETED",
      );
    }
    const body = await request.json();
    const validation = updateCommentSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.message, 400, "VALIDATION_ERROR");
    }
    const { content } = validation.data;
    const sanitizedContent = sanitizeContent(content);
    if (!sanitizeContent) {
      return errorResponse("Comment cannot be empty after sanitization", 400);
    }
    const updateComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        content: sanitizedContent,
        isEdited: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
    return NextResponse.json(
      {
        success: true,
        comment: updateComment,
      },
      {
        status: 200,
        headers: getRateLimitHeaders(rateLimitResult),
      },
    );
  } catch (error) {
    return handleApiEror(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { commentId: string } },
) {
  try {
    const { commentId } = params;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return errorResponse("Unathorized", 401, "UNAUTHORIZED");
    }
    const rateLimitResult = await updateCommentLimiter.limit(currentUser.id);
    if (!rateLimitResult.success) {
      const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: `Too many request. Try again in ${retryAfter} seconds.`,
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
    const comment = await validationCommentExists(commentId);
    if (!comment) {
      return errorResponse("comment not found", 404, "NOT FOUND");
    }
    const isOwner = comment.userId === currentUser.id;

    if (!isOwner) {
      return errorResponse(
        "you can only deleted your own comments",
        403,
        "FORBIDEN",
      );
    }
    if (comment.deletedAt) {
      return errorResponse("Comment already deleted", 400, "ALREADY_DELETED");
    }
    await prisma.$transaction(async (tx) => {
      await tx.comment.update({
        where: { id: commentId },
        data: {
          deletedAt: new Date(),
          content: "[deleted]",
        },
      });
      if (comment.parentId) {
        await tx.comment.update({
          where: { id: comment.parentId },
          data: {
            replyCount: {
              decrement: 1,
            },
          },
        });
      }
      await tx.news.update({
        where: { id: comment.newsId },
        data: {
          commentCount: {
            decrement: 1,
          },
        },
      });
    });
    return NextResponse.json({
      success: true,
      message: "comment deleted successfully",
    });
  } catch (error) {
    return handleApiEror(error);
  }
}
