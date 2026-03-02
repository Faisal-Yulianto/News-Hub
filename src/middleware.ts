import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const ROUTES = {
  public: ["/api/news"],
  auth: ["/api/comments", "/api/likes", "/profile"],
  admin: ["/api/admin", "/admin"],
};

function isMatch(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(route + "/");
}

function matchGroup(pathname: string, routes: string[]) {
  return routes.some((route) => isMatch(pathname, route));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApi = pathname.startsWith("/api");

  if (matchGroup(pathname, ROUTES.public)) {
    return NextResponse.next();
  }

  if (matchGroup(pathname, ROUTES.auth) || matchGroup(pathname, ROUTES.admin)) {
    const token = await getToken({ req });

    if (!token) {
      if (isApi) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (matchGroup(pathname, ROUTES.admin) && token.role !== "AUTHOR") {
      if (isApi) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/forbidden", req.url));
    }
  }

  return NextResponse.next();
}
