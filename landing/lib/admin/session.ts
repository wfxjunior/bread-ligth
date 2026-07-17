// ── Admin session tokens ─────────────────────────────────────────────────────
// Stateless, HMAC-SHA256-signed session cookies. Uses Web Crypto only, so the
// same verification code runs in the Edge middleware AND in Node route
// handlers. The cookie is httpOnly + Secure + SameSite=Strict — client
// JavaScript (and localStorage) is never the source of truth for admin auth.

export const ADMIN_COOKIE = "bl_admin_session";
export const SESSION_TTL_S = 8 * 60 * 60; // 8 hours, then re-login

export type AdminRole =
  | "super_admin"
  | "product_admin"
  | "support_admin"
  | "analytics_viewer"
  | "billing_admin";

export interface AdminSession {
  email: string;
  name: string;
  role: AdminRole;
  iat: number; // issued at (unix seconds)
  exp: number; // expires at (unix seconds)
}

function getSecret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV !== "production") {
    // Development-only fallback so the area is explorable locally. Production
    // refuses to issue or accept sessions without a real secret.
    return "bl-dev-only-secret-not-for-production";
  }
  throw new Error("ADMIN_SESSION_SECRET is not configured");
}

const enc = new TextEncoder();

function b64url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bin = "";
  for (const b of arr) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    enc.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function createSessionToken(
  session: Omit<AdminSession, "iat" | "exp">,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: AdminSession = { ...session, iat: now, exp: now + SESSION_TTL_S };
  const body = b64url(enc.encode(JSON.stringify(payload)));
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(), enc.encode(body));
  return `${body}.${b64url(sig)}`;
}

/** Returns the session if the token is authentic and unexpired, else null. */
export async function verifySessionToken(token: string | undefined): Promise<AdminSession | null> {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  try {
    const ok = await crypto.subtle.verify(
      "HMAC",
      await hmacKey(),
      b64urlDecode(sig) as unknown as ArrayBuffer,
      enc.encode(body),
    );
    if (!ok) return null;
    const payload = JSON.parse(new TextDecoder().decode(b64urlDecode(body))) as AdminSession;
    if (typeof payload.exp !== "number" || payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (!payload.email || !payload.role) return null;
    return payload;
  } catch {
    return null;
  }
}
