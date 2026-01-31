import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, getClientIp } from "@/lib/auth-helper";
import { commentReadLimiter, getRateLimitHeaders } from "@/lib/rate-limit";
import { paginationSchema } from "@/lib/validation/comments-validtion";
import { errorResponse, handleApiEror } from "@/lib/api-helper";

export async function GET(
  request: NextRequest,
  { params }: { params: { commentId: string } }
) {
  try {
    const { commentId } = params;
    const { searchParams } = new URL(request.url);

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
        parentId: commentId,
        deletedAt: null,
      },
    });
    const replies = await prisma.comment.findMany({
      where: {
        parentId: commentId,
        deletedAt: null,
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
      orderBy: {
        createdAt: "asc",
      },
      skip,
      take: limit,
    });
    let likeStatuses: Map<string, boolean> = new Map();
    
    if (currentUser && replies.length > 0) {
      const replyIds = replies.map(r => r.id);

      const likes = await prisma.commentLike.findMany({
        where: {
          userId: currentUser.id,
          commentId: {
            in: replyIds,
          },
        },
        select: {
          commentId: true,
        },
      });

      likeStatuses = new Map(likes.map(l => [l.commentId, true]));
    }
    const formattedReplies = replies.map(reply => ({
      ...reply,
      isLikedByCurrentUser: likeStatuses.get(reply.id) || false,
    }));

    return NextResponse.json(
      {
        replies: formattedReplies, 
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