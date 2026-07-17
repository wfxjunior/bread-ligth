import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken, ADMIN_COOKIE } from "@/lib/admin/session";
import { recordAudit } from "@/lib/admin/data/audit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await verifySessionToken(req.cookies.get(ADMIN_COOKIE)?.value);
  if (session) recordAudit({ admin: session.email, action: "admin_logout", target: "-", result: "ok" });
  const res = NextResponse.redirect(new URL("/admin/login", req.url), { status: 303 });
  res.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
