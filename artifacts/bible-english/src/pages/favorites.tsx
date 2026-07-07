import React, { useState } from 'react';
import { Layout } from '../components/layout';
import { MOCK_FAVORITES, MOCK_CHAPTER_FAVORITES, MOCK_BOOK_FAVORITES } from '../data/mock';
import { Bookmark, ArrowRight, BookOpen, Library } from 'lucide-react';
import { Link } from 'wouter';

type Tab = 'verses' | 'chapters' | 'books';

export default function FavoritesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('verses');

  return (
    <Layout>
      <div className="max-w-4xl mx-auto w-full p-8 md:p-12 overflow-y-auto">
        <header className="mb-8">
          <h1 className="font-serif text-4xl text-primary mb-2">Favorites</h1>
          <p className="text-muted-foreground font-medium">Your saved verses, chapters, and books</p>
        </header>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-muted/50 border border-border rounded-lg p-1 w-fit mb-8">
          {(['verses', 'chapters', 'books'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              aria-label={`Show ${tab}`}
              className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${
                activeTab === tab
                  ? 'bg-card border border-border text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Verses */}
        {activeTab === 'verses' && (
          <div className="space-y-4">
            {MOCK_FAVORITES.map(fav => (
              <div key={fav.id} className="bg-card border border-border p-6 rounded-xl hover:border-primary/30 transition-all flex gap-6 items-start group">
                <div className="mt-1 p-2 bg-primary/5 rounded-full text-primary shrink-0">
                  <Bookmark className="w-5 h-5 fill-primary/20" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-serif text-xl font-medium text-foreground">{fav.reference}</span>
                  </div>
                  <p className="font-serif text-xl leading-relaxed text-muted-foreground">
                    {fav.text}
                  </p>
                </div>
                <Link href="/" className="p-3 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors self-center" aria-label="Open in reader">
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Chapters */}
        {activeTab === 'chapters' && (
          <div className="space-y-4">
            {MOCK_CHAPTER_FAVORITES.map(ch => (
              <div key={ch.id} className="bg-card border border-border p-6 rounded-xl hover:border-primary/30 transition-all flex gap-6 items-start group">
                <div className="mt-1 p-2 bg-primary/5 rounded-full text-primary shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="font-serif text-xl font-medium text-foreground">{ch.book} — Chapter {ch.chapter}</span>
                  <p className="text-xs text-muted-foreground mt-1 mb-2">{ch.verseCount} verses</p>
                  <p className="font-serif text-base leading-relaxed text-muted-foreground italic">"{ch.snippet}"</p>
                </div>
                <Link href="/" className="p-3 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors self-center" aria-label="Open in reader">
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Books */}
        {activeTab === 'books' && (
          <div className="space-y-4">
            {MOCK_BOOK_FAVORITES.map(book => (
              <div key={book.id} className="bg-card border border-border p-6 rounded-xl hover:border-primary/30 transition-all flex gap-6 items-start group">
                <div className="mt-1 p-2 bg-primary/5 rounded-full text-primary shrink-0">
                  <Library className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="font-serif text-xl font-medium text-foreground">{book.name}</span>
                  <p className="text-xs text-muted-foreground mt-1">{book.testament} · {book.chapters} chapters</p>
                </div>
                <Link
                  href={`/book/${book.name.toLowerCase()}`}
                  className="p-3 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors self-center"
                  aria-label={`Open ${book.name}`}
                >
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            ))}
          </div>
        )}

      </div>
    </Layout>
  );
}
