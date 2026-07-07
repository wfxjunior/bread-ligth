---
name: Stripe donation integration
description: How the Bread&Light donation flow is wired (API server + mobile modal).
---

## Rule
`success_url` and `cancel_url` in Stripe Checkout sessions MUST be built from server-side environment variables only — never from request headers (`x-forwarded-host`, `host`, etc.).

**Why:** Attacker-controlled headers let bad actors craft Stripe sessions that redirect donors to phishing domains after payment. This is a real trust-boundary violation caught in code review.

**How to apply:** Use `process.env["REPLIT_DEV_DOMAIN"]` on Replit, or `process.env["PUBLIC_URL"]` in production. Throw if neither is set — don't silently fall back to headers.

## Currency
Currency is hardcoded to `"usd"` server-side. The mobile client sends only `amount` (integer cents). The API ignores any client-supplied currency field.

## Amount validation
Server enforces: integer, 100–1_000_000 cents ($1–$10,000). Anything outside → 400.

## Error handling
Stripe errors are logged server-side (logger.error); the client receives a generic "Payment service error" message.

## Mobile flow
1. User picks preset ($10/$20/$50/$100) or types custom in DonationModal (settings.tsx).
2. Modal POSTs to `${EXPO_PUBLIC_DOMAIN}/api/donations/checkout-session` with `{ amount: cents }`.
3. On success, opens the Stripe-hosted checkout URL via `Linking.openURL`.
4. After payment, Stripe redirects to `/api/donations/success` (styled thank-you HTML page).
