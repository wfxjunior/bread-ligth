// ── Audit log (append-only, best-effort until a database is connected) ──────
// Entries are appended to module memory and mirrored to the server log stream
// (visible in Vercel/Replit logs, which ARE durable). The UI is explicit that
// in-memory entries are volatile; wiring this to the api-server's Postgres is
// the documented next integration. Nothing here is ever exposed publicly.

import type { AuditEntry } from "./types";

const entries: AuditEntry[] = [];
let counter = 0;

export function recordAudit(e: Omit<AuditEntry, "id" | "at">): void {
  const entry: AuditEntry = { ...e, id: `a${++counter}`, at: new Date().toISOString() };
  entries.unshift(entry);
  if (entries.length > 500) entries.pop();
  // Durable mirror: structured line in the server log.
  console.log(`[admin-audit] ${entry.at} ${entry.admin} ${entry.action} target=${entry.target} result=${entry.result}`);
}

export function getAuditEntries(): AuditEntry[] {
  return [...entries];
}
