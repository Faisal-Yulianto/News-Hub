import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

type Role = "READER" | "AUTHOR" | "ADMIN";

const ROLE_HIERARCHY: Record<Role, number> = {
  READER: 1,
  AUTHOR: 2,
  ADMIN: 3,
};

const ROUTES = {
  public: ["/api/news" , "/api/admin/analytics", "/news", "/login", "/register"],
  protected: ["/api/comments", "/api/likes", "/profile"],
  author: ["/author/dashboard", "/api/author"],
  admin: ["/admin", "/api/admin"],
};

function isMatch(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(route + "/");
}

function matchGroup(pathname: string, routes: string[]) {
  return routes.some((route) => isMatch(pathname, route));
}

function isValidRole(role: unknown): role is Role {
  return role === "READER" || role === "AUTHOR" || role === "ADMIN";
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApi = pathname.startsWith("/api");

  if (matchGroup(pathname, ROUTES.public)) {
    return NextResponse.next();
  }

  const token = await getToken({ req });
  if (matchGroup(pathname, ROUTES.protected)) {
    if (!token) {
      return isApi
        ? NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        : NextResponse.redirect(new URL("/login", req.url));
    }
  }

  if (matchGroup(pathname, ROUTES.author)) {
    if (!token || !isValidRole(token.role)) {
      return isApi
        ? NextResponse.json({ message: "Forbidden" }, { status: 403 })
        : NextResponse.redirect(new URL("/forbidden", req.url));
    }

    if (ROLE_HIERARCHY[token.role] < ROLE_HIERARCHY.AUTHOR) {
      return isApi
        ? NextResponse.json({ message: "Forbidden" }, { status: 403 })
        : NextResponse.redirect(new URL("/forbidden", req.url));
    }
  }
  if (matchGroup(pathname, ROUTES.admin)) {
    if (!token || !isValidRole(token.role)) {
      return isApi
        ? NextResponse.json({ message: "Forbidden" }, { status: 403 })
        : NextResponse.redirect(new URL("/forbidden", req.url));
    }

    if (ROLE_HIERARCHY[token.role] < ROLE_HIERARCHY.ADMIN) {
      return isApi
        ? NextResponse.json({ message: "Forbidden" }, { status: 403 })
        : NextResponse.redirect(new URL("/forbidden", req.url));
    }
  }

  return NextResponse.next();
}