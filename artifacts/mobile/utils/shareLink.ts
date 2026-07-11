// ── Shareable app link ──────────────────────────────────────────────────────
// Points share/invite messages at the Bible English landing page (the
// `bible-english` web artifact in this same project), served on this repl's
// own domain under the "/bible-english/" path. A previous version hardcoded
// `https://bibleenglish.app`, an unregistered domain that always failed to
// load — this always resolves to a real, reachable page in dev and once
// deployed (the whole repl publishes together under one domain).
const _domain = process.env.EXPO_PUBLIC_DOMAIN;

export const APP_SHARE_URL = _domain
  ? `https://${_domain}/bible-english/`
  : 'https://bibleenglish.app';
