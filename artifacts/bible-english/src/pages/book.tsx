import React from 'react';
import { Layout } from '../components/layout';
import { useParams, Link } from 'wouter';
import { BookOpen, ChevronRight, CheckCircle, Clock, ArrowLeft } from 'lucide-react';

const BOOK_DATA: Record<string, { name: string; chapters: number; testament: string; completedChapters: number; description: string }> = {
  john: { name: 'John', chapters: 21, testament: 'New Testament', completedChapters: 1, description: 'The Gospel of John presents Jesus as the eternal Word of God, emphasizing belief and eternal life.' },
  genesis: { name: 'Genesis', chapters: 50, testament: 'Old Testament', completedChapters: 0, description: 'The book of beginnings — creation, the fall, the flood, and the founding of the covenant people.' },
  psalms: { name: 'Psalms', chapters: 150, testament: 'Old Testament', completedChapters: 0, description: 'A collection of sacred poetry and hymns expressing the full range of human experience before God.' },
  proverbs: { name: 'Proverbs', chapters: 31, testament: 'Old Testament', completedChapters: 0, description: 'Ancient wisdom literature offering practical guidance for living with integrity and understanding.' },
  isaiah: { name: 'Isaiah', chapters: 66, testament: 'Old Testament', completedChapters: 0, description: 'The great prophet of Israel, whose writings span judgment and extraordinary promises of redemption.' },
  matthew: { name: 'Matthew', chapters: 28, testament: 'New Testament', completedChapters: 0, description: 'The Gospel presenting Jesus as the fulfillment of Jewish prophecy and the long-awaited Messiah.' },
  mark: { name: 'Mark', chapters: 16, testament: 'New Testament', completedChapters: 0, description: 'The shortest Gospel, written with urgency and immediacy, focusing on the actions of Jesus.' },
  luke: { name: 'Luke', chapters: 24, testament: 'New Testament', completedChapters: 0, description: 'A carefully researched account of the life of Jesus, emphasizing compassion for the marginalized.' },
  acts: { name: 'Acts', chapters: 28, testament: 'New Testament', completedChapters: 0, description: 'The history of the early church and the spread of the gospel from Jerusalem to Rome.' },
  romans: { name: 'Romans', chapters: 16, testament: 'New Testament', completedChapters: 0, description: "Paul's most systematic theological letter, exploring sin, salvation, grace, and the life of faith." },
  '1-corinthians': { name: '1 Corinthians', chapters: 16, testament: 'New Testament', completedChapters: 0, description: "Paul's letter addressing division, spiritual gifts, and Christian conduct in a complex urban church." },
};

const EST_MINUTES_PER_CHAPTER = 5;

export default function BookPage() {
  const params = useParams<{ name: string }>();
  const bookKey = params.name?.toLowerCase() ?? '';
  const book = BOOK_DATA[bookKey];

  if (!book) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto w-full p-8 md:p-12">
          <h1 className="font-serif text-3xl text-foreground mb-4">Book not found</h1>
          <Link href="/library" className="text-primary text-sm font-medium hover:underline">← Back to Library</Link>
        </div>
      </Layout>
    );
  }

  const progressPct = book.chapters > 0 ? Math.round((book.completedChapters / book.chapters) * 100) : 0;
  const totalMinutes = book.chapters * EST_MINUTES_PER_CHAPTER;
  const nextChapter = book.completedChapters + 1;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto w-full p-8 md:p-12 overflow-y-auto">

        {/* Back */}
        <Link href="/library" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-3.5 h-3.5" />
          Library
        </Link>

        {/* Header */}
        <header className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-2">{book.testament}</p>
          <h1 className="font-serif text-5xl text-primary mb-4">{book.name}</h1>
          <p className="text-muted-foreground leading-relaxed max-w-xl">{book.description}</p>

          <div className="flex items-center gap-6 mt-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              {book.chapters} chapters
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              ~{totalMinutes >= 60 ? `${Math.round(totalMinutes / 60)}h` : `${totalMinutes} min`} total
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              {book.completedChapters} completed
            </span>
          </div>
        </header>

        {/* Progress + Continue */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-10">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Your Progress</p>
              <p className="font-serif text-2xl text-foreground">
                {book.completedChapters > 0 ? `Chapter ${book.completedChapters} of ${book.chapters}` : 'Not started'}
              </p>
            </div>
            <span className="font-serif text-4xl text-primary/40">{progressPct}%</span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mb-5">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progressPct}%` }} />
          </div>
          <Link
            href={book.name === 'John' ? '/' : '#'}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            {book.completedChapters > 0 ? `Continue — Chapter ${nextChapter}` : 'Begin Reading'}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Chapter list */}
        <section>
          <h2 className="font-serif text-2xl text-foreground mb-5">Chapters</h2>
          <div className="space-y-2">
            {Array.from({ length: book.chapters }, (_, i) => {
              const chapterNum = i + 1;
              const isCompleted = chapterNum <= book.completedChapters;
              const isCurrent = chapterNum === book.completedChapters + 1;
              return (
                <Link
                  key={chapterNum}
                  href={book.name === 'John' && chapterNum === 1 ? '/' : '#'}
                  className={`flex items-center justify-between px-5 py-3.5 rounded-xl border transition-all group ${
                    isCurrent
                      ? 'bg-primary/5 border-primary/20 hover:border-primary/40'
                      : isCompleted
                      ? 'bg-background border-border/50 hover:border-border'
                      : 'bg-background border-border/30 hover:border-border hover:bg-muted/30'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      isCompleted ? 'bg-secondary/20 text-secondary' : isCurrent ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                    }`}>
                      {isCompleted
                        ? <CheckCircle className="w-4 h-4" />
                        : <span className="text-xs font-medium">{chapterNum}</span>
                      }
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${isCurrent ? 'text-primary' : 'text-foreground'}`}>
                        Chapter {chapterNum}
                        {isCurrent && <span className="ml-2 text-xs font-normal text-primary/70">Current</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">~{EST_MINUTES_PER_CHAPTER} min</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              );
            })}
          </div>
        </section>

      </div>
    </Layout>
  );
}
