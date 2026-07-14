---
name: Premium feature gating boundary (BreadLight)
description: Where the free/Premium line sits for reading atmospheres & accent colors, and where gating logic lives vs. where it doesn't.
---

**Rule:** Only the default atmosphere (`classic`) and default accent (`burgundy`) are free forever. Every other atmosphere/accent is Premium-gated. This is expressed as a `premium: boolean` field directly on each entry in `ATMOSPHERES`/`ACCENTS` (web: `lib/atmospheres.ts`), not as a separate allowlist — so adding a new atmosphere/accent defaults it to gated unless explicitly marked free.

**Why:** Keeps exactly one source of truth for "is this option free" that both the settings UI and any downstream guard can read, instead of duplicating a list of premium IDs in multiple places.

**How to apply:** Gating is enforced at two separate points, deliberately kept out of the atmosphere/theme context itself:
1. **UI call sites** (e.g. settings appearance tab): block `setAtmosphere`/`setAccentColor` for `premium: true` options unless the user is entitled; show a lock/upsell and route to the pricing page instead of applying the change.
2. **A standalone downgrade-reset guard** mounted where both auth and billing-status queries are available (on web: inside the router tree, sibling to other Clerk/react-query-dependent providers) — it resets a signed-in-but-lapsed (or signed-out) user off a Premium atmosphere/accent back to the free defaults. This exists because a subscription can lapse after the choice was already persisted to local storage.

The atmosphere/theme context stays "dumb" (no entitlement checks inside `setAtmosphere`/`setAccentColor` themselves) because on web it's mounted outside the provider tree that has Clerk/react-query access. If mobile adds the same Premium gating (RevenueCat), keep this same split rather than pushing entitlement checks into the theme context.
