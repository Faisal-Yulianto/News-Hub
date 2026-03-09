import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { visitCreateLimiter, checkRateLimit } from "@/lib/rate-limit";
import { isInternalRoute } from "@/lib/constants";

function getIdentifier(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ua = req.headers.get("user-agent") ?? "unknown";
  return `${ip}:${ua}`;
}

function isSuspiciousUA(ua: string) {
  if (!ua || ua.length < 10) return true;
  return /bot|spider|crawler|curl/i.test(ua);
}

export async function POST(req: Request) {
  const identifier = getIdentifier(req);
  const ua = req.headers.get("user-agent") ?? "";

  if (isSuspiciousUA(ua)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rate = await checkRateLimit(visitCreateLimiter, identifier);
  if (!rate.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { visitorId, page } = body;

  if (
    typeof visitorId !== "string" ||
    visitorId.length > 100 ||
    typeof page !== "string" ||
    page.length > 200 ||
    !page.startsWith("/")
  ) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (isInternalRoute(page)) {
    return NextResponse.json({ success: true });
  }

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;

  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  const existing = await prisma.pageVisit.findFirst({
    where: {
      visitorId,
      page,
      createdAt: {
        gte: fiveMinutesAgo,
      },
    },
  });

  if (existing) {
    return NextResponse.json({ success: true });
  }
  const now = new Date();
  await prisma.pageVisit.create({
    data: {
      visitorId,
      userId,
      page,
      createdAt: now,
      visitDate: new Date(now.toISOString().split("T")[0]),
    },
  });

  return NextResponse.json({ success: true });
}
