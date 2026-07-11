---
name: Share link domains must resolve
description: Don't hardcode an aspirational/placeholder external domain in Share.share() calls — it silently produces a dead link.
---

A `Share.share({ message, url })` call with a hardcoded external domain (e.g. `https://bibleenglish.app`) that was never registered/deployed fails with no error in the app — the share sheet opens fine, the recipient just gets a link that doesn't resolve (DNS failure). This is easy to miss because nothing in the app itself throws.

**How to apply:** when a project has its own web artifact in the same monorepo (a marketing/landing page, etc.), point share/invite links at that artifact's real path on the current domain instead of an external placeholder:
`` `https://${process.env.EXPO_PUBLIC_DOMAIN}/<artifact-preview-path>/` `` — this resolves both in dev preview and once deployed (the whole repl publishes together under one domain). Centralize this in one shared constant/util rather than repeating the domain string at each `Share.share()` call site.
