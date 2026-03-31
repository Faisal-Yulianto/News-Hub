import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleApiEror, errorResponse, succesResponse } from "@/lib/api-helper";
import { requireAuth } from "@/lib/auth-helper";
import {
  checkRateLimit,
  getRateLimitHeaders,
  getIdentifier,
  authorNewsReadLimiter,
  authorNewsUpdateLimiter,
  authorNewsDeleteLimiter,
} from "@/lib/rate-limit";
import { NewsStatus } from "@prisma/client";
import DOMPurify from "isomorphic-dompurify";
import { updateNewsSchema } from "@/lib/validation/update-news-shema";
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 200);
}

async function ensureUniqueSlug(
  baseSlug: string,
  excludeId: string,
): Promise<string> {
  let slug = baseSlug;
  let count = 0;
  while (true) {
    const existing = await prisma.news.findFirst({
      where: { slug, id: { not: excludeId } },
    });
    if (!existing) break;
    count++;
    slug = `${baseSlug}-${count}`;
  }
  return slug;
}

function isDeletableStatus(status: NewsStatus): boolean {
  return status === NewsStatus.DRAFT || status === NewsStatus.REJECTED;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();

    if (user.role !== "AUTHOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const identifier = getIdentifier(req);
    const rateLimitResult = await checkRateLimit(
      authorNewsReadLimiter,
      identifier,
    );
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) },
      );
    }

    const { id } = await params;

    const news = await prisma.news.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        excerpt: true,
        thumbnailUrl: true,
        thumbnailHash: true,
        status: true,
        isBreaking: true,
        views: true,
        likeCount: true,
        commentCount: true,
        source: true,
        metaTitle: true,
        metaDescription: true,
        rejectionReason: true,
        publishedAt: true,
        createdAt: true,
        authorId: true,
        category: {
          select: { id: true, name: true, icon: true, slug: true },
        },
        contentImages: {
          select: { id: true, url: true, caption: true, imageHash: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!news) {
      return errorResponse("News not found", 404, "NOT_FOUND");
    }

    if (news.authorId !== user.id) {
      return errorResponse("Forbidden", 403, "FORBIDDEN");
    }

    return succesResponse(news);
  } catch (error) {
    return handleApiEror(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();

    if (user.role !== "AUTHOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const identifier = getIdentifier(req);
    const rateLimitResult = await checkRateLimit(
      authorNewsUpdateLimiter,
      identifier,
    );
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) },
      );
    }
    const { id } = await params;

    const news = await prisma.news.findUnique({
      where: { id },
      select: { id: true, authorId: true, status: true },
    });

    if (!news) {
      return errorResponse("News not found", 404, "NOT_FOUND");
    }

    if (news.authorId !== user.id) {
      return errorResponse("Forbidden", 403, "FORBIDDEN");
    }

    if (news.status !== NewsStatus.DRAFT) {
      return errorResponse(
        "Only draft news can be edited",
        400,
        "INVALID_STATUS",
      );
    }

    const body = await req.json();
    const parsed = updateNewsSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.message, 400, "VALIDATION_ERROR");
    }

    const {
      title,
      excerpt,
      content,
      categoryId,
      thumbnailUrl,
      thumbnailHash,
      source,
      isBreaking,
      metaTitle,
      metaDescription,
      contentImages,
      status,
    } = parsed.data;

    const sanitizedContent = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [
        "p",
        "br",
        "strong",
        "em",
        "u",
        "s",
        "h1",
        "h2",
        "h3",
        "h4",
        "ul",
        "ol",
        "li",
        "blockquote",
        "a",
        "img",
        "code",
        "pre",
      ],
      ALLOWED_ATTR: ["href", "src", "alt", "target", "rel", "class"],
    });

    if (!sanitizedContent || sanitizedContent.trim().length < 10) {
      return errorResponse(
        "Content is too short or invalid",
        400,
        "VALIDATION_ERROR",
      );
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      return errorResponse("Category not found", 404, "NOT_FOUND");
    }

    const baseSlug = generateSlug(title);
    const slug = await ensureUniqueSlug(baseSlug, id);

    const updated = await prisma.$transaction(async (tx) => {
      const updatedNews = await tx.news.update({
        where: { id },
        data: {
          title,
          slug,
          excerpt,
          content: sanitizedContent,
          thumbnailUrl,
          thumbnailHash,
          source,
          isBreaking,
          metaTitle: metaTitle || null,
          metaDescription: metaDescription || null,
          status,
          publishedAt: null,
        },
      });

      await tx.contentImage.deleteMany({ where: { newsId: id } });

      if (contentImages.length > 0) {
        await tx.contentImage.createMany({
          data: contentImages.map((img) => ({
            url: img.url,
            imageHash: img.hash,
            caption: img.caption || null,
            newsId: id,
          })),
        });
      }

      return updatedNews;
    });

    return succesResponse({
      id: updated.id,
      slug: updated.slug,
      status: updated.status,
    });
  } catch (error) {
    return handleApiEror(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();

    if (user.role !== "AUTHOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const identifier = getIdentifier(req);
    const rateLimitResult = await checkRateLimit(
      authorNewsDeleteLimiter,
      identifier,
    );
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) },
      );
    }
    const { id } = await params;
    const news = await prisma.news.findUnique({
      where: { id },
      select: { id: true, authorId: true, status: true },
    });

    if (!news) {
      return errorResponse("News not found", 404, "NOT_FOUND");
    }

    if (news.authorId !== user.id) {
      return errorResponse("Forbidden", 403, "FORBIDDEN");
    }

    if (!isDeletableStatus(news.status)) {
      return errorResponse(
        "Only draft or rejected news can be deleted",
        400,
        "INVALID_STATUS",
      );
    }

    await prisma.news.delete({ where: { id } });

    return succesResponse({ message: "News deleted successfully" });
  } catch (error) {
    return handleApiEror(error);
  }
}
