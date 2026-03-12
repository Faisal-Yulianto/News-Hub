import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  checkRateLimit,
  adminNewsReadLimiter,
  getIdentifier,
  getRateLimitHeaders,
  adminNewsUpdateLimiter,
  adminNewsDeleteLimiter,
} from "@/lib/rate-limit";
import { handleApiEror, succesResponse, errorResponse } from "@/lib/api-helper";
import { NewsStatus } from "@prisma/client";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const identifier = getIdentifier(req);
    const rate = await checkRateLimit(adminNewsReadLimiter, identifier);
    if (!rate.success) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: getRateLimitHeaders(rate) },
      );
    }
    const { id } = await params;
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    const news = await prisma.news.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
        thumbnailUrl: true,
        status: true,
        isBreaking: true,
        rejectionReason: true,
        reviewedAt: true,
        publishedAt: true,
        createdAt: true,
        author: {
          select: { name: true, avatar: true },
        },
        category: {
          select: { name: true },
        },
        contentImages: {
          select: { url: true },
        },
      },
    });
    if (!news) {
      return NextResponse.json({ error: "News not found" }, { status: 404 });
    }

    return succesResponse(news);
  } catch (error) {
    return handleApiEror(error);
  }
}

const VALID_UPDATE_STATUSES = ["PUBLISHED", "REJECTED"] as const;

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const identifier = getIdentifier(req);
    const rate = await checkRateLimit(adminNewsUpdateLimiter, identifier);
    if (!rate.success) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: getRateLimitHeaders(rate) },
      );
    }
    const { id } = await params;
    if (!id || typeof id !== "string") {
      return errorResponse("Invalid id", 400);
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return errorResponse("Invalid JSON", 400);
    }

    const { status, rejectionReason } = body;
    if (!VALID_UPDATE_STATUSES.includes(status)) {
      return errorResponse("Invalid status", 400);
    }
    if (
      status === "REJECTED" &&
      (!rejectionReason ||
        typeof rejectionReason !== "string" ||
        rejectionReason.trim().length === 0)
    ) {
      return errorResponse("Rejection reason is required", 400);
    }
    const existing = await prisma.news.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!existing) {
      return errorResponse("News not found", 404);
    }
    if (existing.status !== "PENDING_REVIEW") {
      return errorResponse(
        "Hanya artikel dengan status Menunggu Review yang dapat diproses",
        400,
      );
    }
    const updated = await prisma.news.update({
      where: { id },
      data: {
        status: status as NewsStatus,
        reviewedAt: new Date(),
        rejectionReason: status === "REJECTED" ? rejectionReason.trim() : null,
        publishedAt: status === "PUBLISHED" ? new Date() : undefined,
      },
      select: {
        id: true,
        status: true,
        reviewedAt: true,
        publishedAt: true,
      },
    });

    return succesResponse(updated);
  } catch (error) {
    return handleApiEror(error);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const identifier = getIdentifier(req);
    const rate = await checkRateLimit(adminNewsDeleteLimiter, identifier);
    if (!rate.success) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: getRateLimitHeaders(rate) },
      );
    }
    const { id } = await params;
    if (!id || typeof id !== "string") {
      return errorResponse("Invalid id", 400);
    }
    const existing = await prisma.news.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return errorResponse("News not found", 404);
    }
    await prisma.news.delete({ where: { id } });

    return succesResponse({ message: "Artikel berhasil dihapus" });
  } catch (error) {
    return handleApiEror(error);
  }
}
