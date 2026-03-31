import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleApiEror, errorResponse, succesResponse } from "@/lib/api-helper";
import { requireAuth } from "@/lib/auth-helper";
import {
  checkRateLimit,
  getRateLimitHeaders,
  getIdentifier,
  authorNewsCreateLimiter,
} from "@/lib/rate-limit";
import DOMPurify from "isomorphic-dompurify";
import { createNewsSchema } from "@/lib/validation/add-news-validation";


function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 200);
}

async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let count = 0;

  while (true) {
    const existing = await prisma.news.findUnique({ where: { slug } });
    if (!existing) break;
    count++;
    slug = `${baseSlug}-${count}`;
  }

  return slug;
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();

    if (user.role !== "AUTHOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const identifier = getIdentifier(req);
    const rateLimitResult = await checkRateLimit(
      authorNewsCreateLimiter,
      identifier
    );
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    const body = await req.json();
    const parsed = createNewsSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(
        parsed.error.message,
        400,
        "VALIDATION_ERROR"
      );
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
        "p", "br", "strong", "em", "u", "s", "h1", "h2", "h3", "h4",
        "ul", "ol", "li", "blockquote", "a", "img", "code", "pre",
      ],
      ALLOWED_ATTR: ["href", "src", "alt", "target", "rel", "class"],
    });

    if (!sanitizedContent || sanitizedContent.trim().length < 10) {
      return errorResponse("Content is too short or invalid", 400, "VALIDATION_ERROR");
    }
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      return errorResponse("Category not found", 404, "NOT_FOUND");
    }
    const baseSlug = generateSlug(title);
    const slug = await ensureUniqueSlug(baseSlug);

    const news = await prisma.$transaction(async (tx) => {
      const created = await tx.news.create({
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
          authorId: user.id,
          categoryId,
          publishedAt: null,
        },
      });

      if (contentImages.length > 0) {
        await tx.contentImage.createMany({
          data: contentImages.map((img) => ({
            url: img.url,
            imageHash: img.hash,
            caption: img.caption || null,
            newsId: created.id,
          })),
        });
      }

      return created;
    });

    return succesResponse({ id: news.id, slug: news.slug, status: news.status }, 201);
  } catch (error) {
    return handleApiEror(error);
  }
}