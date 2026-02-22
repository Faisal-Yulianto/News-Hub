import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_ROUTES = [
  "/api/news",
  "/api/comments",
];

const AUTH_ROUTES = [
  "/api/comments",
  "/api/likes",
];

const ADMIN_ROUTES = [
  "/api/admin",
  "/admin",
];

function matchRoute(pathname: string, routes: string[]) {
  return routes.some(route => pathname.startsWith(route));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (matchRoute(pathname, PUBLIC_ROUTES)) {
    return NextResponse.next();
  }

  const token = await getToken({ req });

  if (matchRoute(pathname, AUTH_ROUTES)) {
    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  if (matchRoute(pathname, ADMIN_ROUTES)) {
    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (token.role !== "admin") {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/admin/:path*"],
};
