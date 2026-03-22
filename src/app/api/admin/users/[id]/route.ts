import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  checkRateLimit,
  adminUserUpdateLimiter,
  getIdentifier,
  getRateLimitHeaders,
} from "@/lib/rate-limit";
import { handleApiEror, succesResponse, errorResponse } from "@/lib/api-helper";
import { Role } from "@prisma/client";

const VALID_ASSIGN_ROLES = ["READER", "AUTHOR"] as const;

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const identifier = getIdentifier(req);
    const rate = await checkRateLimit(adminUserUpdateLimiter, identifier);
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

    const { role } = body;
    if (!VALID_ASSIGN_ROLES.includes(role)) {
      return errorResponse("Forbidden", 403);
    }
    const existing = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    });

    if (!existing) {
      return errorResponse("User not found", 404);
    }
    if (existing.role === "ADMIN") {
      return errorResponse("Forbidden", 403);
    }
    if (existing.role === role) {
      return errorResponse("Role sudah sama", 400);
    }
    const updated = await prisma.user.update({
      where: { id },
      data: { role: role as Role },
      select: { id: true, role: true },
    });

    return succesResponse(updated);
  } catch (error) {
    return handleApiEror(error);
  }
}
