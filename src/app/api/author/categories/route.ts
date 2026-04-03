import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {  handleApiEror, succesResponse, errorResponse } from "@/lib/api-helper";
import { requireAuth } from "@/lib/auth-helper";
import { checkRateLimit, getRateLimitHeaders, getIdentifier, authorCategoryReadLimiter, authorCategoryCreateLimiter } from "@/lib/rate-limit";
import { revalidatePath } from "next/cache";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function GET(req: Request) {
  try {
    const user = await requireAuth();

    if (user.role !== "AUTHOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const identifier = getIdentifier(req);
    const rateLimitResult = await checkRateLimit(authorCategoryReadLimiter, identifier);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    const categories = await prisma.category.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        createdById: true,
        createdAt: true,
        _count: {
          select: { news: true },
        },
      },
    });

    const result = categories.map((cat) => ({
      ...cat,
      newsCount: cat._count.news,
      isOwner: cat.createdById === user.id,
    }));

    return succesResponse(result);
  } catch (error) {
    return handleApiEror(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();

    if (user.role !== "AUTHOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const identifier = getIdentifier(req);
    const rateLimitResult = await checkRateLimit(authorCategoryCreateLimiter, identifier);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
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
        OR: [
          { name: { equals: name.trim(), mode: "insensitive" } },
          { slug },
        ],
      },
    });

    if (existing) {
      return errorResponse("Category name already exists", 409, "DUPLICATE_ERROR");
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug,
        icon: icon?.trim() || null,
        createdById: user.id,
      },
    });
    revalidatePath("/"); 

    return succesResponse(category, 201);
  } catch (error) {
    return handleApiEror(error);
  }
}