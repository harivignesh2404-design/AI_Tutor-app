import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Protect /dashboard: redirect to /login if no auth cookie (runtime only; build does not run middleware)
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get("auth")?.value;
    if (!token) {
      const login = new URL("/login", request.url);
      return NextResponse.redirect(login);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
