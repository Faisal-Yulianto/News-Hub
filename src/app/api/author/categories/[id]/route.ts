import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleApiEror, succesResponse, errorResponse } from "@/lib/api-helper";
import { requireAuth } from "@/lib/auth-helper";
import { checkRateLimit, getRateLimitHeaders, getIdentifier, authorCategoryUpdateLimiter, authorCategoryDeleteLimiter } from "@/lib/rate-limit";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    if (user.role !== "AUTHOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const identifier = getIdentifier(req);
    const rateLimitResult = await checkRateLimit(authorCategoryUpdateLimiter, identifier);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }
    const { id } = await params;

    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return errorResponse("Category not found", 404, "NOT_FOUND");
    }

    if (category.createdById !== user.id) {
      return errorResponse("Forbidden", 403, "FORBIDDEN");
    }

    const body = await req.json();
    const { name, icon } = body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return errorResponse("Name is required", 400, "VALIDATION_ERROR");
    }

    if (name.trim().length > 50) {
      return errorResponse("Name too long, max 50 characters", 400, "VALIDATION_ERROR");
    }

    if (icon !== undefined && icon !== null) {
      if (typeof icon !== "string") {
        return errorResponse("Invalid icon format", 400, "VALIDATION_ERROR");
      }
      if (icon.trim().length > 100) {
        return errorResponse("Icon string too long, max 100 characters", 400, "VALIDATION_ERROR");
      }
      const iconifyRegex = /^[a-z0-9-]+:[a-z0-9-]+$/;
      if (icon.trim() !== "" && !iconifyRegex.test(icon.trim())) {
        return errorResponse("Invalid icon format, expected format: prefix:icon-name", 400, "VALIDATION_ERROR");
      }
    }

    const slug = generateSlug(name.trim());

    const existing = await prisma.category.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          {
            OR: [
              { name: { equals: name.trim(), mode: "insensitive" } },
              { slug },
            ],
          },
        ],
      },
    });

    if (existing) {
      return errorResponse("Category name already exists", 409, "DUPLICATE_ERROR");
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: name.trim(),
        slug,
        icon: icon?.trim() || null,
      },
    });

    return succesResponse(updated);
  } catch (error) {
    return handleApiEror(error);
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();

    if (user.role !== "AUTHOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const identifier = getIdentifier(req);
    const rateLimitResult = await checkRateLimit(authorCategoryDeleteLimiter, identifier);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { news: true },
        },
      },
    });

    if (!category) {
      return errorResponse("Category not found", 404, "NOT_FOUND");
    }

    if (category.createdById !== user.id) {
      return errorResponse("Forbidden", 403, "FORBIDDEN");
    }

    await prisma.category.delete({
      where: { id: params.id },
    });

    return succesResponse({
      message: "Category deleted successfully",
      deletedNewsCount: category._count.news,
    });
  } catch (error) {
    return handleApiEror(error);
  }
}