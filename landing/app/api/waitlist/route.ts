import { NextResponse } from "next/server";

// ── Waitlist adapter ──────────────────────────────────────────────────────────
// Honest by design: this route only reports success when the entry was actually
// stored. Wire ONE provider via env vars and it persists for real. With nothing
// configured it echoes success in development (so you can see the UI flow) but
// refuses in production, so real signups are never silently dropped.
//
// Supported providers (set WAITLIST_PROVIDER + the matching keys):
//   - "convertkit":  CONVERTKIT_API_KEY, CONVERTKIT_FORM_ID
//   - "buttondown":  BUTTONDOWN_API_KEY
//   - "resend":      RESEND_API_KEY, RESEND_AUDIENCE_ID
//   - "supabase":    SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  (table: waitlist)
// See README.md → "Waitlist integration".

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Entry { firstName: string; email: string }
interface StoreResult { stored: boolean; duplicate?: boolean }

export async function POST(req: Request) {
  let body: Partial<Entry>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const firstName = String(body.firstName ?? "").trim().slice(0, 80);
  const email = String(body.email ?? "").trim().toLowerCase().slice(0, 254);
  if (!firstName || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  try {
    const result = await store({ firstName, email });
    if (result.duplicate) {
      return NextResponse.json({ error: "duplicate" }, { status: 409 });
    }
    if (!result.stored) {
      // No provider configured.
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "not_configured" }, { status: 503 });
      }
      // Dev echo — clearly not persisted.
      console.warn(
        "[waitlist] No WAITLIST_PROVIDER configured — entry NOT stored:",
        { firstName, email },
      );
      return NextResponse.json({ ok: true, stored: false });
    }
    return NextResponse.json({ ok: true, stored: true });
  } catch (err) {
    console.error("[waitlist] provider error:", err);
    return NextResponse.json({ error: "provider_error" }, { status: 500 });
  }
}

async function store(entry: Entry): Promise<StoreResult> {
  const provider = process.env.WAITLIST_PROVIDER;

  if (provider === "convertkit") {
    const res = await fetch(
      `https://api.convertkit.com/v3/forms/${process.env.CONVERTKIT_FORM_ID}/subscribe`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: process.env.CONVERTKIT_API_KEY,
          email: entry.email,
          first_name: entry.firstName,
        }),
      },
    );
    if (!res.ok) throw new Error(`convertkit ${res.status}`);
    return { stored: true };
  }

  if (provider === "buttondown") {
    const res = await fetch("https://api.buttondown.email/v1/subscribers", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.BUTTONDOWN_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email_address: entry.email, metadata: { first_name: entry.firstName } }),
    });
    if (res.status === 409 || res.status === 400) return { stored: false, duplicate: true };
    if (!res.ok) throw new Error(`buttondown ${res.status}`);
    return { stored: true };
  }

  if (provider === "resend") {
    const res = await fetch(
      `https://api.resend.com/audiences/${process.env.RESEND_AUDIENCE_ID}/contacts`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: entry.email, first_name: entry.firstName }),
      },
    );
    if (!res.ok) throw new Error(`resend ${res.status}`);
    return { stored: true };
  }

  if (provider === "supabase") {
    const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/waitlist`, {
      method: "POST",
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ first_name: entry.firstName, email: entry.email }),
    });
    if (res.status === 409) return { stored: false, duplicate: true };
    if (!res.ok) throw new Error(`supabase ${res.status}`);
    return { stored: true };
  }

  // Nothing configured.
  return { stored: false };
}
