---
name: Home "Today's Study" card
description: What the Study card (Read/Listen/Learn/Reflect) on the Home screen actually is and how its steps work.
---

## Rule
The Home screen's "ESTUDO" card (`StudyCard` in `app/(tabs)/index.tsx`) is a **hardcoded, always-John-1** feature — it is not tied to the date-rotating daily devotional at `/daily`. The two are separate features that happen to sit near each other on Home.

Its four steps (Read/Listen/Learn/Reflect) expand **inline as an accordion** (one string `expandedStep` state + `LayoutAnimation`), not a modal — this keeps Home uncluttered by default while the content is genuinely functional, not decorative:
- **Read** — real John 1 verses from `BIBLE_DATA['john'].chapters[1]`, bilingual (EN + PT), with a button into the real `/chapter` route.
- **Listen** — a real inline `AudioPlayer` (`compact`) on the shared audio engine, `queueKey: 'study:john:1'`.
- **Learn** — taps on `VOCAB_PREVIEW` words open the real shared `WordModal` (same dictionary/vocabulary system used elsewhere).
- **Reflect** — a free-text reflection saved to AsyncStorage (`@bibliaeN:reflection:john:1`); there is no app-wide journal/notes system, so this is a standalone per-passage note, not linked to the unrelated "Favoritos"/bookmarks (saved-verses) feature.

**Why:** User asked for the steps to "open activities below, not pollute the home screen" and for them to "actually work" — reusing existing systems (dictionary, audio engine, chapter routing) was chosen over inventing new placeholder content, per the project's decorative-vs-functional principle.

**How to apply:** If asked to translate this card (a separate proposed task existed for this) or make it date-driven like `/daily`, know that today it is intentionally static/English-titled and independent of the daily rotation — treat that as a deliberate starting point, not a bug.
