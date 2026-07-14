---
name: Stripe connector credential fetch + migration bundling
description: Two non-obvious bugs when wiring the Stripe connector's raw REST credential-fetch pattern into a bundled Node server; check this before assuming the skill template's code snippet is correct as-is.
---

## Connection API query param and field names

The `stripe` skill's `getStripeCredentials()` template code (and the general connector template) as commonly written uses:
- `connector_names=stripe` (plural) as the query param — this silently returns `items: []` (0 results, HTTP 200, no error). The working param name is **singular**: `connector_name=stripe`.
- `settings.secret_key` / `settings.webhook_secret` as the credential field names — the actual connection's `settings` object uses **`settings.secret`** (the live secret key) and **`settings.publishable`**. There is no `webhook_secret` field in `settings` at all.

**Why:** These were discovered by comparing a raw `fetch()` against the connectors API directly (with different query param spellings) against what the app code expected — the plural param and `_key`/`_secret`-suffixed field names look plausible but don't match the real API shape.

**How to apply:** When a Stripe (or likely any) connector's credential fetch returns "not connected" despite `searchIntegrations`/`addIntegration` confirming status `added`, don't just re-propose the integration — first hit the connectors REST endpoint directly from a shell/node one-liner with `include_secrets=true` and no filter, inspect the real `items[0].settings` keys, then fix the param name and field names in the fetch code to match.

## stripe-replit-sync migrations silently no-op when bundled

`stripe-replit-sync`'s `runMigrations()` resolves its SQL migrations directory via `path.dirname(fileURLToPath(import.meta.url))` relative to its own module. If your server bundles all dependencies into a single output file (e.g. esbuild `bundle: true`), this computed path collapses to the *output bundle's* directory, not the package's real `dist/migrations` folder. `fs.existsSync` on the wrong path fails, migrations are skipped with no error, and later `stripe.accounts` (or any stripe.*) table lookups fail with `relation does not exist` even though `CREATE SCHEMA IF NOT EXISTS stripe` still ran fine (schema exists, tables don't).

**Why:** esbuild rewrites `import.meta.url` per-module at bundle time only if it can resolve static analysis; when modules are concatenated, path-relative-to-self patterns like this break silently instead of erroring.

**How to apply:** Add `stripe-replit-sync` to the bundler's `external` list (keep it resolved from `node_modules` at runtime, not inlined) whenever it's used inside a bundled server build. Same caution applies to any other dependency that reads sibling files relative to its own module path (the project's esbuild config already externalizes several native/path-traversal-dependent packages for this exact reason — this is the same class of bug).
