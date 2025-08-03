// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ─── PUBLIC ROUTES ───────────────────────────────────────────────
  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot" ||     // ← add this
    pathname === "/reset" ||      // ← and this if you have a client-side reset page
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/password") ||  // allow your new password-API
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // ─── AUTH CHECK ─────────────────────────────────────────────────
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ─── RBAC EXAMPLE ────────────────────────────────────────────────
  if (pathname.startsWith("/admin") && token.role !== "admin") {
    return new NextResponse("Access denied", { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
