// ── Admin identity (Node-only) ───────────────────────────────────────────────
// Admin accounts come exclusively from environment variables — no hardcoded
// credentials, no plaintext passwords, no self-registration.
//
//   ADMIN_EMAIL          primary admin's email
//   ADMIN_PASSWORD_HASH  scrypt hash — generate with:
//                        node scripts/hash-admin-password.mjs "your password"
//   ADMIN_NAME           display name (optional)
//   ADMIN_USERS          optional JSON array for more admins:
//                        [{"email":"a@b.c","name":"Ana","role":"support_admin",
//                          "passwordHash":"scrypt:..."}]
//
// Hash format: scrypt:N:r:p:<salt b64>:<key b64>

import { scrypt, timingSafeEqual, randomBytes } from "node:crypto";
import type { AdminRole } from "./session";

export interface AdminAccount {
  email: string;
  name: string;
  role: AdminRole;
  passwordHash: string;
}

const VALID_ROLES: AdminRole[] = [
  "super_admin",
  "product_admin",
  "support_admin",
  "analytics_viewer",
  "billing_admin",
];

export function getAdminDirectory(): AdminAccount[] {
  const out: AdminAccount[] = [];
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const hash = process.env.ADMIN_PASSWORD_HASH?.trim();
  if (email && hash) {
    out.push({ email, name: process.env.ADMIN_NAME?.trim() || "Admin", role: "super_admin", passwordHash: hash });
  }
  const extra = process.env.ADMIN_USERS;
  if (extra) {
    try {
      const parsed = JSON.parse(extra) as Array<Partial<AdminAccount>>;
      for (const a of parsed) {
        if (!a?.email || !a.passwordHash) continue;
        out.push({
          email: String(a.email).trim().toLowerCase(),
          name: a.name ? String(a.name) : "Admin",
          role: VALID_ROLES.includes(a.role as AdminRole) ? (a.role as AdminRole) : "analytics_viewer",
          passwordHash: String(a.passwordHash),
        });
      }
    } catch {
      /* malformed ADMIN_USERS — ignore rather than crash login */
    }
  }
  return out;
}

export function hashPassword(password: string): Promise<string> {
  const N = 16384, r = 8, p = 1;
  const salt = randomBytes(16);
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 32, { N, r, p }, (err, key) => {
      if (err) reject(err);
      else resolve(`scrypt:${N}:${r}:${p}:${salt.toString("base64")}:${key.toString("base64")}`);
    });
  });
}

export function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split(":");
  if (parts.length !== 6 || parts[0] !== "scrypt") return Promise.resolve(false);
  const [, nS, rS, pS, saltB64, keyB64] = parts;
  const N = Number(nS), r = Number(rS), p = Number(pS);
  const salt = Buffer.from(saltB64, "base64");
  const expected = Buffer.from(keyB64, "base64");
  if (!N || !r || !p || salt.length === 0 || expected.length === 0) return Promise.resolve(false);
  return new Promise((resolve) => {
    scrypt(password, salt, expected.length, { N, r, p }, (err, key) => {
      if (err) resolve(false);
      else resolve(timingSafeEqual(key, expected));
    });
  });
}

// ── Role-based permissions ───────────────────────────────────────────────────
// Central permission map: pages/actions check capabilities, never raw roles,
// so adding a role later touches exactly one file.

export type Capability =
  | "view_dashboard"
  | "view_users"
  | "view_billing"
  | "manage_support"
  | "create_exports"
  | "view_audit_log"
  | "manage_settings";

const ROLE_CAPS: Record<AdminRole, Capability[]> = {
  super_admin: ["view_dashboard", "view_users", "view_billing", "manage_support", "create_exports", "view_audit_log", "manage_settings"],
  product_admin: ["view_dashboard", "view_users", "view_billing", "create_exports", "view_audit_log"],
  billing_admin: ["view_dashboard", "view_billing", "create_exports"],
  support_admin: ["view_dashboard", "view_users", "manage_support"],
  analytics_viewer: ["view_dashboard"],
};

export function can(role: AdminRole, capability: Capability): boolean {
  return ROLE_CAPS[role]?.includes(capability) ?? false;
}
