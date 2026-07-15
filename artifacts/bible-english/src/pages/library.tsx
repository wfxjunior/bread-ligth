import { useMemo, useState } from 'react';
import { Layout } from '../components/layout';
import { Search, X, Sun, Music, Leaf, Flame, Crown, Zap, HeartHandshake, Feather, Wind, Landmark, Heart, BookMarked } from 'lucide-react';
import { BookshelfCabinet, BookshelfRow, type BookCategory, type ShelfBook } from '../components/leather-book-cover';

// The full 66-book biblical canon, grouped by traditional category (matching
// the mobile app's bookshelf) so the shelf reads like a complete, curated
// library. Genesis, Psalms, Proverbs, Matthew, John, Romans, Philippians and
// 1 Corinthians have their real text; every other book renders the same
// leather cover with a "coming soon" note until its text is transcribed —
// the shelf itself should never look cut off or incomplete.
const ALL_BOOKS: ShelfBook[] = [
  { id: 'genesis', name: 'Genesis', category: 'pentateuch', testament: 'old', roman: 'I', era: 'c. 1400 BC', tagline: 'In the Beginning, God', chapters: 50, progress: 0, icon: Sun },
  { id: 'exodus', name: 'Exodus', category: 'pentateuch', testament: 'old', roman: 'II', era: 'c. 1400 BC', tagline: 'Out of Bondage', chapters: 40, progress: 0, icon: BookMarked },
  { id: 'leviticus', name: 'Leviticus', category: 'pentateuch', testament: 'old', roman: 'III', era: 'c. 1400 BC', tagline: 'The Way to Holiness', chapters: 27, progress: 0, icon: BookMarked },
  { id: 'numbers', name: 'Numbers', category: 'pentateuch', testament: 'old', roman: 'IV', era: 'c. 1400 BC', tagline: 'Wilderness Wandering', chapters: 36, progress: 0, icon: BookMarked },
  { id: 'deuteronomy', name: 'Deuteronomy', category: 'pentateuch', testament: 'old', roman: 'V', era: 'c. 1400 BC', tagline: 'The Law Renewed', chapters: 34, progress: 0, icon: BookMarked },
  { id: 'joshua', name: 'Joshua', category: 'history', testament: 'old', roman: 'VI', era: 'c. 1400 BC', tagline: 'Into the Promised Land', chapters: 24, progress: 0, icon: BookMarked },
  { id: 'judges', name: 'Judges', category: 'history', testament: 'old', roman: 'VII', era: 'c. 1100 BC', tagline: 'Cycles of Deliverance', chapters: 21, progress: 0, icon: BookMarked },
  { id: 'ruth', name: 'Ruth', category: 'history', testament: 'old', roman: 'VIII', era: 'c. 1100 BC', tagline: 'Loyalty and Redemption', chapters: 4, progress: 0, icon: BookMarked },
  { id: '1-samuel', name: '1 Samuel', category: 'history', testament: 'old', roman: 'IX', era: 'c. 1000 BC', tagline: 'The Rise of a King', chapters: 31, progress: 0, icon: BookMarked },
  { id: '2-samuel', name: '2 Samuel', category: 'history', testament: 'old', roman: 'X', era: 'c. 1000 BC', tagline: 'David\'s Reign', chapters: 24, progress: 0, icon: BookMarked },
  { id: '1-kings', name: '1 Kings', category: 'history', testament: 'old', roman: 'XI', era: 'c. 900 BC', tagline: 'A Kingdom Divided', chapters: 22, progress: 0, icon: BookMarked },
  { id: '2-kings', name: '2 Kings', category: 'history', testament: 'old', roman: 'XII', era: 'c. 800 BC', tagline: 'The Fall of Israel', chapters: 25, progress: 0, icon: BookMarked },
  { id: '1-chronicles', name: '1 Chronicles', category: 'history', testament: 'old', roman: 'XIII', era: 'c. 450 BC', tagline: 'A Nation Remembered', chapters: 29, progress: 0, icon: BookMarked },
  { id: '2-chronicles', name: '2 Chronicles', category: 'history', testament: 'old', roman: 'XIV', era: 'c. 450 BC', tagline: 'The Temple and the Throne', chapters: 36, progress: 0, icon: BookMarked },
  { id: 'ezra', name: 'Ezra', category: 'history', testament: 'old', roman: 'XV', era: 'c. 450 BC', tagline: 'Return and Rebuild', chapters: 10, progress: 0, icon: BookMarked },
  { id: 'nehemiah', name: 'Nehemiah', category: 'history', testament: 'old', roman: 'XVI', era: 'c. 430 BC', tagline: 'Walls Restored', chapters: 13, progress: 0, icon: BookMarked },
  { id: 'esther', name: 'Esther', category: 'history', testament: 'old', roman: 'XVII', era: 'c. 450 BC', tagline: 'For Such a Time as This', chapters: 10, progress: 0, icon: BookMarked },
  { id: 'job', name: 'Job', category: 'poetry', testament: 'old', roman: 'XVIII', era: 'c. 1500 BC', tagline: 'Faith Through Suffering', chapters: 42, progress: 0, icon: BookMarked },
  { id: 'psalms', name: 'Psalms', category: 'poetry', testament: 'old', roman: 'XIX', era: 'c. 1000 BC', tagline: 'Songs of the Soul', chapters: 150, progress: 0, icon: Music },
  { id: 'proverbs', name: 'Proverbs', category: 'poetry', testament: 'old', roman: 'XX', era: 'c. 950 BC', tagline: 'Wisdom for Living', chapters: 31, progress: 0, icon: Leaf },
  { id: 'ecclesiastes', name: 'Ecclesiastes', category: 'poetry', testament: 'old', roman: 'XXI', era: 'c. 930 BC', tagline: 'Meaning Under the Sun', chapters: 12, progress: 0, icon: BookMarked },
  { id: 'song-of-solomon', name: 'Song of Solomon', category: 'poetry', testament: 'old', roman: 'XXII', era: 'c. 950 BC', tagline: 'A Song of Love', chapters: 8, progress: 0, icon: BookMarked },
  { id: 'isaiah', name: 'Isaiah', category: 'majorProphets', testament: 'old', roman: 'XXIII', era: 'c. 700 BC', tagline: 'Judgment and Hope', chapters: 66, progress: 0, icon: Flame },
  { id: 'jeremiah', name: 'Jeremiah', category: 'majorProphets', testament: 'old', roman: 'XXIV', era: 'c. 600 BC', tagline: 'The Weeping Prophet', chapters: 52, progress: 0, icon: BookMarked },
  { id: 'lamentations', name: 'Lamentations', category: 'majorProphets', testament: 'old', roman: 'XXV', era: 'c. 586 BC', tagline: 'Grief and Hope', chapters: 5, progress: 0, icon: BookMarked },
  { id: 'ezekiel', name: 'Ezekiel', category: 'majorProphets', testament: 'old', roman: 'XXVI', era: 'c. 570 BC', tagline: 'Visions by the River', chapters: 48, progress: 0, icon: BookMarked },
  { id: 'daniel', name: 'Daniel', category: 'majorProphets', testament: 'old', roman: 'XXVII', era: 'c. 540 BC', tagline: 'Faithful in Exile', chapters: 12, progress: 0, icon: BookMarked },
  { id: 'hosea', name: 'Hosea', category: 'minorProphets', testament: 'old', roman: 'XXVIII', era: 'c. 750 BC', tagline: 'Unfailing Love', chapters: 14, progress: 0, icon: BookMarked },
  { id: 'joel', name: 'Joel', category: 'minorProphets', testament: 'old', roman: 'XXIX', era: 'c. 830 BC', tagline: 'The Day of the Lord', chapters: 3, progress: 0, icon: BookMarked },
  { id: 'amos', name: 'Amos', category: 'minorProphets', testament: 'old', roman: 'XXX', era: 'c. 760 BC', tagline: 'A Cry for Justice', chapters: 9, progress: 0, icon: BookMarked },
  { id: 'obadiah', name: 'Obadiah', category: 'minorProphets', testament: 'old', roman: 'XXXI', era: 'c. 840 BC', tagline: 'Pride Brought Low', chapters: 1, progress: 0, icon: BookMarked },
  { id: 'jonah', name: 'Jonah', category: 'minorProphets', testament: 'old', roman: 'XXXII', era: 'c. 780 BC', tagline: 'Mercy for Nineveh', chapters: 4, progress: 0, icon: BookMarked },
  { id: 'micah', name: 'Micah', category: 'minorProphets', testament: 'old', roman: 'XXXIII', era: 'c. 700 BC', tagline: 'What the Lord Requires', chapters: 7, progress: 0, icon: BookMarked },
  { id: 'nahum', name: 'Nahum', category: 'minorProphets', testament: 'old', roman: 'XXXIV', era: 'c. 650 BC', tagline: 'Judgment on Nineveh', chapters: 3, progress: 0, icon: BookMarked },
  { id: 'habakkuk', name: 'Habakkuk', category: 'minorProphets', testament: 'old', roman: 'XXXV', era: 'c. 610 BC', tagline: 'Waiting on God', chapters: 3, progress: 0, icon: BookMarked },
  { id: 'zephaniah', name: 'Zephaniah', category: 'minorProphets', testament: 'old', roman: 'XXXVI', era: 'c. 630 BC', tagline: 'A Day of Restoration', chapters: 3, progress: 0, icon: BookMarked },
  { id: 'haggai', name: 'Haggai', category: 'minorProphets', testament: 'old', roman: 'XXXVII', era: 'c. 520 BC', tagline: 'Rebuild the House', chapters: 2, progress: 0, icon: BookMarked },
  { id: 'zechariah', name: 'Zechariah', category: 'minorProphets', testament: 'old', roman: 'XXXVIII', era: 'c. 520 BC', tagline: 'Visions of Hope', chapters: 14, progress: 0, icon: BookMarked },
  { id: 'malachi', name: 'Malachi', category: 'minorProphets', testament: 'old', roman: 'XXXIX', era: 'c. 430 BC', tagline: 'A Call to Return', chapters: 4, progress: 0, icon: BookMarked },
  { id: 'matthew', name: 'Matthew', category: 'gospels', testament: 'new', roman: 'I', era: 'c. AD 60', tagline: 'The King and His Kingdom', chapters: 28, progress: 0, icon: Crown },
  { id: 'mark', name: 'Mark', category: 'gospels', testament: 'new', roman: 'II', era: 'c. AD 55', tagline: 'The Kingdom in Action', chapters: 16, progress: 0, icon: Zap },
  { id: 'luke', name: 'Luke', category: 'gospels', testament: 'new', roman: 'III', era: 'c. AD 60', tagline: 'Good News for All', chapters: 24, progress: 0, icon: HeartHandshake },
  { id: 'john', name: 'John', category: 'gospels', testament: 'new', roman: 'IV', era: 'c. AD 90', tagline: 'The Word Became Flesh', chapters: 21, progress: 1, icon: Feather },
  { id: 'acts', name: 'Acts', category: 'acts', testament: 'new', roman: 'V', era: 'c. AD 62', tagline: 'The Spirit at Work', chapters: 28, progress: 0, icon: Wind },
  { id: 'romans', name: 'Romans', category: 'paulineLetters', testament: 'new', roman: 'VI', era: 'c. AD 57', tagline: 'The Gospel of Grace', chapters: 16, progress: 0, icon: Landmark },
  { id: '1-corinthians', name: '1 Corinthians', category: 'paulineLetters', testament: 'new', roman: 'VII', era: 'c. AD 55', tagline: 'Love Builds Up', chapters: 16, progress: 0, icon: Heart },
  { id: '2-corinthians', name: '2 Corinthians', category: 'paulineLetters', testament: 'new', roman: 'VIII', era: 'c. AD 56', tagline: 'Strength in Weakness', chapters: 13, progress: 0, icon: BookMarked },
  { id: 'galatians', name: 'Galatians', category: 'paulineLetters', testament: 'new', roman: 'IX', era: 'c. AD 49', tagline: 'Freedom in Christ', chapters: 6, progress: 0, icon: BookMarked },
  { id: 'ephesians', name: 'Ephesians', category: 'paulineLetters', testament: 'new', roman: 'X', era: 'c. AD 62', tagline: 'One Body in Christ', chapters: 6, progress: 0, icon: BookMarked },
  { id: 'philippians', name: 'Philippians', category: 'paulineLetters', testament: 'new', roman: 'XI', era: 'c. AD 62', tagline: 'Joy in Every Circumstance', chapters: 4, progress: 0, icon: BookMarked },
  { id: 'colossians', name: 'Colossians', category: 'paulineLetters', testament: 'new', roman: 'XII', era: 'c. AD 62', tagline: 'Christ Above All', chapters: 4, progress: 0, icon: BookMarked },
  { id: '1-thessalonians', name: '1 Thessalonians', category: 'paulineLetters', testament: 'new', roman: 'XIII', era: 'c. AD 51', tagline: 'Living in Hope', chapters: 5, progress: 0, icon: BookMarked },
  { id: '2-thessalonians', name: '2 Thessalonians', category: 'paulineLetters', testament: 'new', roman: 'XIV', era: 'c. AD 52', tagline: 'Steadfast to the End', chapters: 3, progress: 0, icon: BookMarked },
  { id: '1-timothy', name: '1 Timothy', category: 'paulineLetters', testament: 'new', roman: 'XV', era: 'c. AD 63', tagline: 'A Faithful Shepherd', chapters: 6, progress: 0, icon: BookMarked },
  { id: '2-timothy', name: '2 Timothy', category: 'paulineLetters', testament: 'new', roman: 'XVI', era: 'c. AD 67', tagline: 'Fight the Good Fight', chapters: 4, progress: 0, icon: BookMarked },
  { id: 'titus', name: 'Titus', category: 'paulineLetters', testament: 'new', roman: 'XVII', era: 'c. AD 63', tagline: 'Sound Doctrine, Good Works', chapters: 3, progress: 0, icon: BookMarked },
  { id: 'philemon', name: 'Philemon', category: 'paulineLetters', testament: 'new', roman: 'XVIII', era: 'c. AD 62', tagline: 'A Plea for Reconciliation', chapters: 1, progress: 0, icon: BookMarked },
  { id: 'hebrews', name: 'Hebrews', category: 'generalLetters', testament: 'new', roman: 'XIX', era: 'c. AD 65', tagline: 'A Better Covenant', chapters: 13, progress: 0, icon: BookMarked },
  { id: 'james', name: 'James', category: 'generalLetters', testament: 'new', roman: 'XX', era: 'c. AD 45', tagline: 'Faith in Action', chapters: 5, progress: 0, icon: BookMarked },
  { id: '1-peter', name: '1 Peter', category: 'generalLetters', testament: 'new', roman: 'XXI', era: 'c. AD 62', tagline: 'Hope Through Trials', chapters: 5, progress: 0, icon: BookMarked },
  { id: '2-peter', name: '2 Peter', category: 'generalLetters', testament: 'new', roman: 'XXII', era: 'c. AD 65', tagline: 'Guard the Truth', chapters: 3, progress: 0, icon: BookMarked },
  { id: '1-john', name: '1 John', category: 'generalLetters', testament: 'new', roman: 'XXIII', era: 'c. AD 90', tagline: 'Walking in the Light', chapters: 5, progress: 0, icon: BookMarked },
  { id: '2-john', name: '2 John', category: 'generalLetters', testament: 'new', roman: 'XXIV', era: 'c. AD 90', tagline: 'Truth and Love', chapters: 1, progress: 0, icon: BookMarked },
  { id: '3-john', name: '3 John', category: 'generalLetters', testament: 'new', roman: 'XXV', era: 'c. AD 90', tagline: 'Faithful Witness', chapters: 1, progress: 0, icon: BookMarked },
  { id: 'jude', name: 'Jude', category: 'generalLetters', testament: 'new', roman: 'XXVI', era: 'c. AD 65', tagline: 'Contend for the Faith', chapters: 1, progress: 0, icon: BookMarked },
  { id: 'revelation', name: 'Revelation', category: 'revelation', testament: 'new', roman: 'XXVII', era: 'c. AD 95', tagline: 'The King Returns', chapters: 22, progress: 0, icon: BookMarked },
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
