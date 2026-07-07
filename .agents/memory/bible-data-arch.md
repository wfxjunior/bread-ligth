---
name: Bible data architecture
description: How BíbliaEN mobile app stores and loads Bible content; split-file pattern for large books.
---

## Rule
`bibleData.ts` imports complete book objects from `constants/bible/*.ts`; no inline book data.

**Why:** Inline data becomes unmanageable for large books (150-chapter Psalms, 50-chapter Genesis). Split-file approach keeps each file under ~200KB and TypeScript compiles cleanly.

## How to apply
For books with many chapters, use chunk files merged via spread:
- Large book: `genesis.ts` spreads `...GENESIS_CH13_31` and `...GENESIS_CH32_50` after inline ch1-12.
- Wrapper pattern: `matthew.ts` spreads `...MATTHEW_CH1_14` + `...MATTHEW_CH15_28`.
- Same for psalms: 3 chunk files combined in `psalms.ts`.

## Current book coverage (all chapters complete)
- Genesis: 50 ch (genesis.ts + genesis-ch13-31.ts + genesis-ch32-50.ts)
- Psalms: 150 ch (psalms.ts → psalms-ch1-50 + psalms-ch51-100 + psalms-ch101-150)
- Proverbs: 31 ch
- Matthew: 28 ch (matthew.ts → matthew-ch1-14 + matthew-ch15-28)
- John: 21 ch
- Romans: 16 ch
- 1 Corinthians: 16 ch (id: '1corinthians', export: firstCorinthiansBook)
- Philippians: 4 ch

## Subagent note
Use `$kind: 'general'` (not 'build') for content-generation subagents that write files.
