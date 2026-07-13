---
name: Leather book cover rendering
description: How the bookshelf covers (BookshelfLibrary.tsx) get a photoreal leather look while staying per-category colored.
---

## Rule
`LeatherBook` in `components/BookshelfLibrary.tsx` layers a single reusable photographed leather-grain texture (`assets/images/leather-texture.jpg`, generated once, warm mid-brown, macro close-up) as an `Image` (`resizeMode="cover"`) directly under the existing per-category `LinearGradient` tint. The tint is kept at high opacity (`base + 'E6'` / `deep + 'F2'`, i.e. ~90-95%) so it still reads clearly as that category's color, while the leather grain shows through as fine texture rather than a flat vector fill. The shelf-wide ambient light (`cabinetLight` gradient in the same file) simulates a soft overhead light source across the whole shelf.

**Why:** User wanted "real leather, visible texture, soft light on the shelf" (matching an uploaded reference of photoreal vintage book covers) instead of the previous flat gradient-only covers. Generating one shared texture and tinting it per category avoids generating 8+ separate textures while still giving every book a convincing material look.

**How to apply:** If more categories/books are added, or the reference style changes, reuse the same `leather-texture.jpg` under the new category's gradient rather than generating a new texture per book — the tint color is what differentiates books, not the underlying grain.

## Web port
The same look was ported to the web app's Library page (`artifacts/bible-english/src/components/leather-book-cover.tsx`): the RN `Image`+`LinearGradient` layering becomes stacked absolutely-positioned `div`s with CSS `background-image`/`linear-gradient`, using a copy of the same texture at `artifacts/bible-english/public/textures/leather-texture.jpg` (referenced as `${import.meta.env.BASE_URL}textures/leather-texture.jpg`, not a root-relative path). `CATEGORY_INFO` hex values, roman numerals, and the wood-cabinet/shelf-plank backdrop are kept identical to mobile so the two platforms read as the same product; only the flavor-text language differs (English taglines on web vs Portuguese on mobile, since web's UI is English-first).
