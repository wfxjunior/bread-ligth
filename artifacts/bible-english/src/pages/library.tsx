import { useMemo, useState } from 'react';
import { Layout } from '../components/layout';
import { Search, X, Sun, Music, Leaf, Flame, Crown, Zap, HeartHandshake, Feather, Wind, Landmark, Heart } from 'lucide-react';
import { BookshelfCabinet, BookshelfRow, type BookCategory, type ShelfBook } from '../components/leather-book-cover';

// The full set of books currently available to read on Bread&Light. Grouped
// by traditional biblical category (matching the mobile app's bookshelf) so
// the library reads like a real, curated collection rather than a flat list.
const ALL_BOOKS: ShelfBook[] = [
  { id: 'genesis', name: 'Genesis', category: 'pentateuch', testament: 'old', roman: 'I', era: 'c. 1400 BC', tagline: 'In the Beginning, God', chapters: 50, progress: 0, icon: Sun },
  { id: 'psalms', name: 'Psalms', category: 'poetry', testament: 'old', roman: 'XIX', era: 'c. 1000 BC', tagline: 'Songs of the Soul', chapters: 150, progress: 0, icon: Music },
  { id: 'proverbs', name: 'Proverbs', category: 'poetry', testament: 'old', roman: 'XX', era: 'c. 950 BC', tagline: 'Wisdom for Living', chapters: 31, progress: 0, icon: Leaf },
  { id: 'isaiah', name: 'Isaiah', category: 'majorProphets', testament: 'old', roman: 'XXIII', era: 'c. 700 BC', tagline: 'Judgment and Hope', chapters: 66, progress: 0, icon: Flame },
  { id: 'matthew', name: 'Matthew', category: 'gospels', testament: 'new', roman: 'XL', era: 'c. AD 60', tagline: 'The King and His Kingdom', chapters: 28, progress: 0, icon: Crown },
  { id: 'mark', name: 'Mark', category: 'gospels', testament: 'new', roman: 'XLI', era: 'c. AD 55', tagline: 'The Kingdom in Action', chapters: 16, progress: 0, icon: Zap },
  { id: 'luke', name: 'Luke', category: 'gospels', testament: 'new', roman: 'XLII', era: 'c. AD 60', tagline: 'Good News for All', chapters: 24, progress: 0, icon: HeartHandshake },
  { id: 'john', name: 'John', category: 'gospels', testament: 'new', roman: 'XLIII', era: 'c. AD 90', tagline: 'The Word Became Flesh', chapters: 21, progress: 1, icon: Feather },
  { id: 'acts', name: 'Acts', category: 'acts', testament: 'new', roman: 'XLIV', era: 'c. AD 62', tagline: 'The Spirit at Work', chapters: 28, progress: 0, icon: Wind },
  { id: 'romans', name: 'Romans', category: 'paulineLetters', testament: 'new', roman: 'XLV', era: 'c. AD 57', tagline: 'The Gospel of Grace', chapters: 16, progress: 0, icon: Landmark },
  { id: '1-corinthians', name: '1 Corinthians', category: 'paulineLetters', testament: 'new', roman: 'XLVI', era: 'c. AD 55', tagline: 'Love Builds Up', chapters: 16, progress: 0, icon: Heart },
];

const CATEGORY_ORDER: BookCategory[] = [
  'pentateuch', 'history', 'poetry', 'majorProphets', 'minorProphets',
  'gospels', 'acts', 'paulineLetters', 'generalLetters', 'revelation',
];

export default function LibraryPage() {
  const [query, setQuery] = useState('');

  const booksByCategory = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q ? ALL_BOOKS.filter(b => b.name.toLowerCase().includes(q)) : ALL_BOOKS;
    const map = new Map<BookCategory, ShelfBook[]>();
    for (const book of filtered) {
      const list = map.get(book.category) ?? [];
      list.push(book);
      map.set(book.category, list);
    }
    return map;
  }, [query]);

  const hasResults = Array.from(booksByCategory.values()).some(list => list.length > 0);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto w-full p-8 md:p-12 overflow-y-auto">
        <header className="mb-8">
          <h1 className="font-serif text-4xl text-primary mb-2">Library</h1>
          <p className="text-muted-foreground font-medium">Browse books of the Bible to study</p>
        </header>

        {/* Search */}
        <div className="relative mb-10 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search books…"
            className="w-full bg-card border border-border rounded-full pl-10 pr-9 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {hasResults ? (
          <BookshelfCabinet>
            <div className="space-y-8">
              {CATEGORY_ORDER.map(category => (
                <BookshelfRow key={category} category={category} books={booksByCategory.get(category) ?? []} />
              ))}
            </div>
          </BookshelfCabinet>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            No books match "{query}".
          </div>
        )}
      </div>
    </Layout>
  );
}
