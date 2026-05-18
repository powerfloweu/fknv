import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PASSWORD = "PHDiana!";
const COOKIE_NAME = "fknv_auth";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Allow login page and auth API without check
  if (path.startsWith("/login") || path.startsWith("/api/login")) {
    return NextResponse.next();
  }

  // Allow static assets
  if (
    path.startsWith("/_next") ||
    path.startsWith("/favicon") ||
    /\.(png|jpg|jpeg|gif|svg|webp|ico|pdf|css|js|woff2?|ttf)$/i.test(path)
  ) {
    return NextResponse.next();
  }

  // Check auth cookie
  const auth = request.cookies.get(COOKIE_NAME);
  if (auth?.value === PASSWORD) {
    return NextResponse.next();
  }

  // Redirect to /login (preserve target as ?from=…)
  const loginUrl = new URL("/login", request.url);
  if (path !== "/" && path !== "/login") {
    loginUrl.searchParams.set("from", path);
  }
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Match all paths except those starting with _next, favicon, or with file extensions
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
