---
name: Web library/bookshelf data source
description: How the web app's Library shelf and book detail page get their book list, and why it must stay in sync with mobile's full-canon pattern.
---

`artifacts/bible-english/src/pages/library.tsx` (`ALL_BOOKS`) and `src/pages/book.tsx`
(`BOOK_DATA`) are two **separate hardcoded arrays/records**, not derived from mobile's
`BIBLE_DATA`/`BOOK_CATALOGUE`. There is no shared bible-data source between web and mobile.

Both were fixed to list all 66 canonical books (mirroring mobile's category/roman-numeral
scheme), with only genesis, psalms, proverbs, matthew, john, romans, philippians, and
1-corinthians carrying real descriptions/content — every other book gets a "coming soon"
description so the shelf never looks cut off and `/book/:id` never 404s for a book that
appears on the shelf.

**Why:** `BookshelfRow` silently returns `null` for empty categories, so a short/partial
book list doesn't error — it just makes whole shelf sections vanish, which is what caused
the "bookshelf disappears after the eighth book" bug. `book.tsx`'s own `BOOK_DATA` must list
the same book ids as `library.tsx`'s `ALL_BOOKS`, or clicking through hits "Book not found".

**How to apply:** When adding/removing a book from the web shelf, update `ALL_BOOKS` and
`BOOK_DATA` together. The web reader (`reader.tsx`) is still backed by `MOCK_VERSES` and only
actually renders real chapter text for John — every other book's "Begin Reading"/chapter
links point at `#` (dead) by design; that's a separate, larger gap from the shelf-display fix.
