// ── Server-side protection for the Admin area ────────────────────────────────
// Every /admin page and /api/admin endpoint is verified HERE, before any code
// or data renders — hiding links in the UI is never the security boundary.
// The matcher only covers admin paths, so the public site's static serving is
// completely untouched.

import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken, ADMIN_COOKIE } from "@/lib/admin/session";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // The login page and login/logout endpoints are the only unauthenticated
  // admin surfaces.
  const isPublicAdminPath =
    pathname === "/admin/login" ||
    pathname === "/api/admin/login" ||
    pathname === "/api/admin/logout";

  const session = await verifySessionToken(req.cookies.get(ADMIN_COOKIE)?.value);

  if (isPublicAdminPath) {
    // Already signed in? Skip the login form.
    if (session && pathname === "/admin/login") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const login = new URL("/admin/login", req.url);
    if (pathname !== "/admin") login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/admin", "/api/admin/:path*"],
};
