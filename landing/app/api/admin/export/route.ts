// ── Secure CSV exports ───────────────────────────────────────────────────────
// Middleware already requires a session; this route re-verifies it, checks the
// role's export capability, records the export in the audit log, and never
// includes secrets, hashes, payment details or private note content.

import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken, ADMIN_COOKIE } from "@/lib/admin/session";
import { can } from "@/lib/admin/auth";
import { getAdminData } from "@/lib/admin/data/provider";
import { recordAudit } from "@/lib/admin/data/audit";

export const runtime = "nodejs";

function csv(rows: Array<Record<string, string | number | boolean | null>>): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v);
    // Neutralize CSV formula injection and quote where needed.
    const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
    return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  return [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
}

export async function GET(req: NextRequest) {
  const session = await verifySessionToken(req.cookies.get(ADMIN_COOKIE)?.value);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(session.role, "create_exports")) {
    recordAudit({ admin: session.email, action: "export_created", target: req.nextUrl.searchParams.get("type") ?? "?", result: "denied" });
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const type = req.nextUrl.searchParams.get("type");
  const data = await getAdminData();

  let body = "";
  if (type === "users" && data.users) {
    body = csv(data.users.map((u) => ({
      id: u.id, name: u.name, email: u.email, country: u.country,
      interface_language: u.interfaceLanguage, learning_language: u.learningLanguage,
      registered_at: u.registeredAt, last_active_at: u.lastActiveAt,
      plan: u.plan, subscription_status: u.subscriptionStatus,
      active_study_days: u.activeStudyDays, chapters_completed: u.chaptersCompleted,
      words_learned: u.wordsLearned, listening_minutes: u.listeningMinutes,
      engagement: u.engagement, platform: u.platform, acquisition_source: u.acquisitionSource,
    })));
  } else if (type === "subscriptions" && data.subscriptions) {
    body = csv(data.subscriptions.map((s) => ({
      id: s.id, user_id: s.userId, status: s.status, interval: s.interval,
      started_at: s.startedAt, canceled_at: s.canceledAt,
      monthly_value_usd: s.monthlyValueUsd.toFixed(2), country: s.country,
    })));
  } else {
    return NextResponse.json({ error: "Unknown or unavailable export type" }, { status: 404 });
  }

  recordAudit({ admin: session.email, action: "export_created", target: `${type}.csv (${data.demo ? "demo" : "live"})`, result: "ok" });

  const filename = `breadlight-${type}${data.demo ? "-DEMO" : ""}-${new Date().toISOString().slice(0, 10)}.csv`;
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
