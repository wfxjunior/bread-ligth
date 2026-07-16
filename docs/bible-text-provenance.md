# Bible text — provenance & licensing

The full 66-book bilingual Bible text under `artifacts/mobile/constants/bible/`
is **auto-generated** from public-domain sources. Do not hand-edit the book
files; regenerate them instead (see below).

## Sources (both Public Domain)

| Language | Translation | Code | License | Source file |
|---|---|---|---|---|
| English | World English Bible | WEB | Public Domain | `eng-web.usfx.xml` |
| Portuguese | João Ferreira de Almeida | Almeida | Public Domain | `por-almeida.usfx.xml` |

Both are distributed by the curated public-domain collection
[`seven1m/open-bibles`](https://github.com/seven1m/open-bibles) in USFX XML:

- `https://raw.githubusercontent.com/seven1m/open-bibles/master/eng-web.usfx.xml`
- `https://raw.githubusercontent.com/seven1m/open-bibles/master/por-almeida.usfx.xml`

**Why public domain matters:** the app is monetized (Stripe subscriptions).
Shipping a copyrighted translation (NVI, ARA, ACF, NIV, ESV, …) in a paid app
would be copyright infringement. WEB + Almeida are both free of such
restrictions. WEB additionally uses clear modern English, which suits English
learners better than the archaic KJV.

## What the generator does

`scripts/generate-bible.py`:

1. Downloads the two USFX files above.
2. Parses each into `book → chapter → verse → text`, stripping footnotes
   (`<f>`), cross-references (`<x>`), and all other markup — verse prose only.
3. Merges the two languages verse-by-verse into the app's shape
   (`{ v, en, pt }`), aligned by book/chapter/verse number.
4. Emits one `constants/bible/<id>.ts` file per book (default-exported
   `BibleBook`) and is wired into `constants/bibleData.ts`.

## Alignment notes

WEB and Almeida follow standard Protestant versification, so ~99.9% of verses
align one-to-one. In the ~22 verses (out of 31,109) where the two number a
passage differently (e.g. the Romans doxology, a few Psalm headings), the
generator keeps the verse visible by falling back to the language that has it
rather than emitting a blank. Totals: **66 books, 31,109 verses.**

## Regenerating

```bash
python3 scripts/generate-bible.py
```

This overwrites every `constants/bible/<id>.ts`. Review the printed
per-book stats (chapters / verses / any fallbacks) before committing.
