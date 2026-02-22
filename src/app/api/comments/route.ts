import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, getClientIp } from "@/lib/auth-helper";
import {
  commentCreateLimiter,
  commentReadLimiter,
  getRateLimitHeaders,
} from "@/lib/rate-limit";
import {
  createCommentSchema,
  paginationSchema,
  sanitizeContent,
  validationNewsExists,
  validationCommentExists,
  isSpamComment,
} from "@/lib/validation/comments-validtion";
import {
  errorResponse,
  handleApiEror,
  MAX_COMMENT_DEPTH,
} from "@/lib/api-helper";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const newsId = searchParams.get("newsId");
    const sort = searchParams.get("sort") || "newest";
    const allowedSort = ["newest", "oldest", "populer"];

    if (!allowedSort.includes(sort)) {
      return errorResponse("invalid input sort parameter");
    }

    if (!newsId) {
      return errorResponse("News ID is required", 400);
    }

    const ip = getClientIp(request);
    const rateLimitResult = await commentReadLimiter.limit(ip);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Too many requests. Please try again later.",
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            ...getRateLimitHeaders(rateLimitResult),
            "Retry-After": Math.ceil(
              (rateLimitResult.reset - Date.now()) / 1000,
            ).toString(),
          },
        },
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

    const currentUser = await getCurrentUser();

    const total = await prisma.comment.count({
      where: {
        newsId,
        parentId: null,
        deletedAt: null,
      },
    });

    let orderBy: Prisma.CommentOrderByWithRelationInput;

    switch (sort) {
      case "newest":
        orderBy = { createdAt: "desc" };
        break;
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "populer":
        orderBy = { likeCount: "desc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    const comments = await prisma.comment.findMany({
      where: {
        newsId,
        parentId: null,
        deletedAt: null,
      },
      include: {
        news: {
          select: {
            commentCount: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        replies: {
          where: {
            deletedAt: null,
          },
          take: 3,
          orderBy: {
            createdAt: "asc",
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
        },
      },
      orderBy,
      skip,
      take: limit,
    });

    let likeStatuses: Map<string, boolean> = new Map();

    if (currentUser) {
      const commentIds = comments.flatMap((c) => [
        c.id,
        ...c.replies.map((r) => r.id),
      ]);

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

      likeStatuses = new Map(likes.map((l) => [l.commentId, true]));
    }

    const formattedComments = comments.map((comment) => ({
      ...comment,
      isLikedByCurrentUser: likeStatuses.get(comment.id) || false,
      replies: comment.replies.map((reply) => ({
        ...reply,
        isLikedByCurrentUser: likeStatuses.get(reply.id) || false,
      })),
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
      },
    );
  } catch (error) {
    return handleApiEror(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    const rateLimitResult = await commentCreateLimiter.limit(currentUser.id);

    if (!rateLimitResult.success) {
      const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: `Too many requests. You can create ${rateLimitResult.limit} comments per minute. Try again in ${retryAfter} seconds.`,
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

    const body = await request.json();
    const validation = createCommentSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(validation.error.message, 400, "VALIDATION_ERROR");
    }

    const { newsId, content, parentId } = validation.data;
    const sanitizedContent = sanitizeContent(content);

    if (!sanitizedContent) {
      return errorResponse("Comment cannot be empty after sanitization", 400);
    }

    const newsExists = await validationNewsExists(newsId);

    if (!newsExists) {
      return errorResponse("News not found", 404, "NEWS_NOT_FOUND");
    }

    const isSpam = await isSpamComment(currentUser.id, sanitizedContent);

    if (isSpam) {
      return errorResponse(
        "Duplicate comment detected. Please wait before posting again.",
        429,
        "SPAM_DETECTED",
      );
    }

    let depth = 0;
    let parentComment = null;

    if (parentId) {
      parentComment = await validationCommentExists(parentId);

      if (!parentComment) {
        return errorResponse(
          "Parent comment not found",
          404,
          "PARENT_NOT_FOUND",
        );
      }

      if (parentComment.newsId !== newsId) {
        return errorResponse(
          "Parent comment must be in the same news",
          400,
          "INVALID_PARENT",
        );
      }

      if (parentComment.deletedAt) {
        return errorResponse(
          "Cannot reply to deleted comment",
          400,
          "PARENT_DELETED",
        );
      }

      depth = parentComment.depth + 1;

      if (depth > MAX_COMMENT_DEPTH) {
        return errorResponse(
          `Maximum nesting depth (${MAX_COMMENT_DEPTH}) exceeded`,
          400,
          "MAX_DEPTH_EXCEEDED",
        );
      }
    }

    const newComment = await prisma.$transaction(async (tx) => {
      const comment = await tx.comment.create({
        data: {
          newsId,
          userId: currentUser.id,
          content: sanitizedContent,
          parentId: parentId || null,
          depth,
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
      if (parentId) {
        await tx.comment.update({
          where: { id: parentId },
          data: {
            replyCount: {
              increment: 1,
            },
          },
        });
      }
      await tx.news.update({
        where: { id: newsId },
        data: {
          commentCount: {
            increment: 1,
          },
        },
      });

      return comment;
    });

    return NextResponse.json(
      {
        success: true,
        comment: {
          ...newComment,
          isLikedByCurrentUser: false,
        },
      },
      {
        status: 201,
        headers: getRateLimitHeaders(rateLimitResult),
      },
    );
  } catch (error) {
    return handleApiEror(error);
  }
}
