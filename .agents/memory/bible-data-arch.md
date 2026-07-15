---
name: Bible data architecture
description: How BIBLE_DATA is assembled from real book files plus placeholders, and the confirmed bookshelf column count at full 66-book scale.
---

## Rule
`bibleData.ts` builds `BIBLE_DATA` by spreading `PLACEHOLDER_BOOKS` (`constants/bible/placeholders.ts`) first, then the real fully-transcribed book files (currently genesis, psalms, proverbs, matthew, john, romans, philippians, 1corinthians) so real books always override their placeholder. Each placeholder has the real PT/EN name and testament but only one "coming soon" chapter/verse — enough for `BookshelfLibrary`'s `LeatherBook` (which does `if (!book) return null`) to render the real cover without crashing, but explicitly not fabricated scripture. `app/(tabs)/index.tsx`'s `BOOK_CATALOGUE` already lists all 66 canonical books with correct category/testament/roman numeral (roman numbering restarts per testament: OT I–XXXIX, NT I–XXVII), ready for real text to be dropped into new book files over time with no further structural change needed.

**Why:** The bookshelf's cards/categories were designed for the full 66-book library from the start (10 `CATEGORY_INFO` entries already cover every category), but only 8 books had real content, so the shelf was invisible-by-default for the other 58 and no one had actually seen it at full scale.

**How to apply:** When transcribing a new book's real text, add its file under `constants/bible/`, import it in `bibleData.ts`, and add it as a real entry in the `BIBLE_DATA` object (after the `PLACEHOLDER_BOOKS` spread) — remove it from `placeholders.ts` at that point since the real entry already overrides. No catalogue/roman-numeral/category change needed, that's already correct.

## Bookshelf columns — confirmed 2, not 3
Rendered `BookshelfLibrary` at COLUMNS=3 with the full 66-book catalogue and screenshotted it: card width shrank enough that hero titles and the "ANTIGO TESTAMENTO" eyebrow text visibly clipped/overflowed (e.g. "LEVITICUS" → ".EVITICUS"). COLUMNS=2 stays legible at all title lengths. Don't revisit 3-per-shelf without a title-truncation/line-height rework first.
