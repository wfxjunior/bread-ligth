import { NextResponse, type NextRequest } from "next/server";
import { getAdminDirectory, verifyPassword } from "@/lib/admin/auth";
import { createSessionToken, ADMIN_COOKIE, SESSION_TTL_S } from "@/lib/admin/session";
import { hit, clear } from "@/lib/admin/rate-limit";
import { recordAudit } from "@/lib/admin/data/audit";

export const runtime = "nodejs";

function clientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export async function POST(req: NextRequest) {
  // Same-origin check: browsers always send Origin on cross-site POSTs, and
  // the session cookie is SameSite=Strict — together this covers CSRF.
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== req.nextUrl.host) {
    return NextResponse.json({ error: "invalid_origin" }, { status: 403 });
  }

  let email = "", password = "";
  try {
    const body = (await req.json()) as { email?: string; password?: string };
    email = String(body.email ?? "").trim().toLowerCase();
    password = String(body.password ?? "");
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  if (!email || !password || email.length > 200 || password.length > 500) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  const ip = clientIp(req);
  const limited = [hit(`ip:${ip}`), hit(`email:${email}`)].find((r) => !r.allowed);
  if (limited) {
    return NextResponse.json(
      { error: "rate_limited", retryAfterS: limited.retryAfterS },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterS) } },
    );
  }

  const directory = getAdminDirectory();
  if (directory.length === 0) {
    // Not configured yet — honest, non-leaky message.
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const account = directory.find((a) => a.email === email);
  // Always run a hash verification so response timing doesn't reveal whether
  // the email exists (dummy hash when the account is unknown).
  const ok = account
    ? await verifyPassword(password, account.passwordHash)
    : await verifyPassword(password, "scrypt:16384:8:1:AAAAAAAAAAAAAAAAAAAAAA==:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=").then(() => false);

  if (!account || !ok) {
    recordAudit({ admin: email, action: "admin_login_failed", target: ip, result: "denied" });
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  clear(`email:${email}`);
  const token = await createSessionToken({ email: account.email, name: account.name, role: account.role });
  recordAudit({ admin: account.email, action: "admin_login", target: ip, result: "ok" });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL_S,
  });
  return res;
}
