---
name: Daily verse utility
description: Shared logic for rotating daily verse selection and per-day completion tracking.
---

## Rule
All daily-verse logic lives in `utils/dailyVerse.ts`. Both the home `DailyCard` and the `daily.tsx` screen import from there.

**Why:** Avoids DST-drift bugs (using `Math.round` over midnight-anchored local dates instead of `Math.floor` over milliseconds) and prevents the two screens from rotating to different verses.

**How to apply:**
- `getEntryForDate(date)` → returns today's `DailyEntry`.
- `resolveVerse(entry)` → returns the `BibleVerse` object or null.
- `todayKey()` → `@bibliaeN:daily:YYYY-MM-DD` key for completion AsyncStorage flag.
- Both screens hold `today` in state and subscribe to `AppState 'active'` events to refresh on midnight rollover — do NOT use `useMemo(() => ..., [])` for date-derived values.
