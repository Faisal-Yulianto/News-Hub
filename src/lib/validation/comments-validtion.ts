import { z } from "zod";
import prisma from "../prisma";

export const createCommentSchema = z.object({
  newsId: z.string().min(1, "News ID is required"),
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(2000, "Comment too long (max 2000 characters)"),
  parentId: z.string().optional(),
});

export const updateCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(2000, "Comment too long (max 2000 characters)"),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export function sanitizeContent(content: string): string {
  return content
    .replace(/<[^>]*>?/gm, "") 
    .replace(/\s+/g, " ")
    .trim();
}

export async function isSpamComment(
  userId: string,
  content: string,
): Promise<boolean> {
  const recentComment = await prisma.comment.findFirst({
    where: {
      userId,
      content,
      createdAt: {
        gte: new Date(Date.now() - 60_000),
      },
    },
    select: { id: true },
  });

  return !!recentComment;
}

export async function validationNewsExists(newsId: string): Promise<boolean> {
  const news = await prisma.news.findUnique({
    where: { id: newsId },
    select: { id: true },
  });

  return !!news;
}

export async function validationCommentExists(commentId: string) {
  return prisma.comment.findUnique({
    where: { id: commentId },
    select: {
      id: true,
      newsId: true,
      userId: true,
      depth: true,
      deletedAt: true,
      replyCount: true,
      parentId: true,
    },
  });
}
