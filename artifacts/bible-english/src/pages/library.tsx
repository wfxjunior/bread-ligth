import React from 'react';
import { Layout } from '../components/layout';
import { BookMarked, ChevronRight } from 'lucide-react';
import { Link } from 'wouter';

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
  return (
    <Layout>
      <div className="max-w-5xl mx-auto w-full p-8 md:p-12 overflow-y-auto">
        <header className="mb-12">
          <h1 className="font-serif text-4xl text-primary mb-2">Library</h1>
          <p className="text-muted-foreground font-medium">Browse books of the Bible to study</p>
        </header>

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
