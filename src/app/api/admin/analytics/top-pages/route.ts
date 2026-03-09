import { NextResponse } from "next/server";
import { getTopPages } from "@/lib/analytics-helper";
import {
  getIdentifier,
  checkRateLimit,
  visitReadLimiter,
} from "@/lib/rate-limit";

export async function GET(req: Request) {
  const identifier = getIdentifier(req);

  const rate = await checkRateLimit(visitReadLimiter, identifier);
  if (!rate.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const data = await getTopPages(10);

  return NextResponse.json(data);
}
