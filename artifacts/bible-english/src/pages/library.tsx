import { useRef } from 'react';
import { Layout } from '../components/layout';
import { BookMarked, ChevronRight, ChevronLeft } from 'lucide-react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';

const FEATURED_BOOKS = [
  { name: 'John', testament: 'New Testament', chapters: 21, bg: 'bg-gradient-to-br from-[#4A1C23] to-[#2E1015]', initial: 'IV', badge: 'In Progress' },
  { name: 'Genesis', testament: 'Old Testament', chapters: 50, bg: 'bg-gradient-to-br from-[#1E3329] to-[#121F19]', initial: 'I' },
  { name: 'Psalms', testament: 'Old Testament', chapters: 150, bg: 'bg-gradient-to-br from-[#B38030] to-[#8C6221]', initial: 'XIX' },
  { name: 'Proverbs', testament: 'Old Testament', chapters: 31, bg: 'bg-gradient-to-br from-[#2D3A4B] to-[#1C242F]', initial: 'XX' },
  { name: 'Matthew', testament: 'New Testament', chapters: 28, bg: 'bg-gradient-to-br from-[#3E141D] to-[#250A10]', initial: 'I' },
  { name: 'Romans', testament: 'New Testament', chapters: 16, bg: 'bg-gradient-to-br from-[#2F2C2A] to-[#1C1A18]', initial: 'VI' },
];

const OLD_TESTAMENT = [
  { name: 'Genesis', chapters: 50, progress: 0 },
  { name: 'Psalms', chapters: 150, progress: 0 },
  { name: 'Proverbs', chapters: 31, progress: 0 },
  { name: 'Isaiah', chapters: 66, progress: 0 },
];

const NEW_TESTAMENT = [
  { name: 'Matthew', chapters: 28, progress: 0 },
  { name: 'Mark', chapters: 16, progress: 0 },
  { name: 'Luke', chapters: 24, progress: 0 },
  { name: 'John', chapters: 21, progress: 1 },
  { name: 'Acts', chapters: 28, progress: 0 },
  { name: 'Romans', chapters: 16, progress: 0 },
  { name: '1 Corinthians', chapters: 16, progress: 0 },
];

export default function LibraryPage() {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth + 40 : scrollLeft + clientWidth - 40;
      carouselRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto w-full p-8 md:p-12 overflow-y-auto">
        <header className="mb-12">
          <h1 className="font-serif text-4xl text-primary mb-2">Library</h1>
          <p className="text-muted-foreground font-medium">Browse books of the Bible to study</p>
        </header>

        <section className="mb-12">
          <div className="flex items-end justify-between border-b border-border pb-4 mb-6">
            <h2 className="font-serif text-2xl text-foreground">Featured Books</h2>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-sm font-medium text-primary hover:underline">
                View All
              </Link>
              <div className="flex gap-2">
                <button 
                  onClick={() => scroll('left')}
                  className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-primary/5 text-foreground transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => scroll('right')}
                  className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-primary/5 text-foreground transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          <div 
            ref={carouselRef}
            className="flex overflow-x-auto gap-4 pb-6 pt-2 snap-x snap-mandatory scrollbar-hide -mx-8 px-8 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden" 
            style={{ scrollbarWidth: 'none' }}
          >
            {FEATURED_BOOKS.map((book) => (
              <Link href={`/book/${book.name.toLowerCase()}`} key={book.name} className="snap-start shrink-0 block">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  className={`w-[200px] h-[280px] rounded-xl p-6 relative overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-shadow flex flex-col justify-between text-white ${book.bg}`}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl font-serif opacity-5 pointer-events-none select-none">
                    {book.initial}
                  </div>
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                  <div className="relative z-10">
                    {book.badge && (
                      <span className="inline-block px-2 py-1 bg-white/20 backdrop-blur-sm text-[10px] uppercase tracking-widest font-bold rounded-full mb-4">
                        {book.badge}
                      </span>
                    )}
                  </div>
                  
                  <div className="relative z-10 text-center mt-auto pb-2">
                    <p className="text-[10px] uppercase tracking-widest font-bold opacity-70 mb-1">{book.testament}</p>
                    <h3 className="font-serif text-3xl mb-1">{book.name}</h3>
                    <p className="text-xs opacity-80">{book.chapters} Chapters</p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-serif text-2xl text-foreground border-b border-border pb-4 mb-6">New Testament</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {NEW_TESTAMENT.map(book => (
              <BookCard key={book.name} book={book} />
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-serif text-2xl text-foreground border-b border-border pb-4 mb-6">Old Testament</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {OLD_TESTAMENT.map(book => (
              <BookCard key={book.name} book={book} />
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}

function BookCard({ book }: { book: { name: string, chapters: number, progress: number } }) {
  const isStarted = book.progress > 0;
  
  return (
    <Link href={`/book/${book.name.toLowerCase().replace(/\s+/g, '-')}`} className="block">
      <div className={`p-5 rounded-xl border transition-all hover:shadow-md group ${
        isStarted ? 'bg-primary/5 border-primary/20 hover:border-primary/40' : 'bg-card border-border hover:border-primary/30'
      }`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isStarted ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl text-foreground group-hover:text-primary transition-colors">{book.name}</h3>
              <p className="text-xs text-muted-foreground">{book.chapters} Chapters</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        
        {isStarted ? (
          <div>
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-primary mb-1.5">
              <span>Continue</span>
              <span>{Math.round((book.progress / book.chapters) * 100)}%</span>
            </div>
            <div className="h-1.5 w-full bg-background rounded-full overflow-hidden border border-border/50">
              <div 
                className="h-full bg-primary" 
                style={{ width: `${(book.progress / book.chapters) * 100}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="h-1.5 w-full bg-muted/50 rounded-full" />
        )}
      </div>
    </Link>
  );
}
