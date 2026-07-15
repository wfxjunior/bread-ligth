import React from 'react';
import { Layout } from '../components/layout';
import { useParams, Link } from 'wouter';
import { BookOpen, ChevronRight, CheckCircle, Clock, ArrowLeft } from 'lucide-react';

// All 66 canonical books. Genesis, Psalms, Proverbs, Matthew, John, Romans,
// Philippians and 1 Corinthians carry their real description; every other
// book still resolves here (instead of "Book not found") with a "coming
// soon" note, matching the full shelf on the Library page.
const BOOK_DATA: Record<string, { name: string; chapters: number; testament: string; completedChapters: number; description: string }> = {
  'genesis': { name: 'Genesis', chapters: 50, testament: 'Old Testament', completedChapters: 0, description: 'The book of beginnings — creation, the fall, the flood, and the founding of the covenant people.' },
  'exodus': { name: 'Exodus', chapters: 40, testament: 'Old Testament', completedChapters: 0, description: 'Out of Bondage — this book is coming soon to Bread&Light.' },
  'leviticus': { name: 'Leviticus', chapters: 27, testament: 'Old Testament', completedChapters: 0, description: 'The Way to Holiness — this book is coming soon to Bread&Light.' },
  'numbers': { name: 'Numbers', chapters: 36, testament: 'Old Testament', completedChapters: 0, description: 'Wilderness Wandering — this book is coming soon to Bread&Light.' },
  'deuteronomy': { name: 'Deuteronomy', chapters: 34, testament: 'Old Testament', completedChapters: 0, description: 'The Law Renewed — this book is coming soon to Bread&Light.' },
  'joshua': { name: 'Joshua', chapters: 24, testament: 'Old Testament', completedChapters: 0, description: 'Into the Promised Land — this book is coming soon to Bread&Light.' },
  'judges': { name: 'Judges', chapters: 21, testament: 'Old Testament', completedChapters: 0, description: 'Cycles of Deliverance — this book is coming soon to Bread&Light.' },
  'ruth': { name: 'Ruth', chapters: 4, testament: 'Old Testament', completedChapters: 0, description: 'Loyalty and Redemption — this book is coming soon to Bread&Light.' },
  '1-samuel': { name: '1 Samuel', chapters: 31, testament: 'Old Testament', completedChapters: 0, description: 'The Rise of a King — this book is coming soon to Bread&Light.' },
  '2-samuel': { name: '2 Samuel', chapters: 24, testament: 'Old Testament', completedChapters: 0, description: 'David\'s Reign — this book is coming soon to Bread&Light.' },
  '1-kings': { name: '1 Kings', chapters: 22, testament: 'Old Testament', completedChapters: 0, description: 'A Kingdom Divided — this book is coming soon to Bread&Light.' },
  '2-kings': { name: '2 Kings', chapters: 25, testament: 'Old Testament', completedChapters: 0, description: 'The Fall of Israel — this book is coming soon to Bread&Light.' },
  '1-chronicles': { name: '1 Chronicles', chapters: 29, testament: 'Old Testament', completedChapters: 0, description: 'A Nation Remembered — this book is coming soon to Bread&Light.' },
  '2-chronicles': { name: '2 Chronicles', chapters: 36, testament: 'Old Testament', completedChapters: 0, description: 'The Temple and the Throne — this book is coming soon to Bread&Light.' },
  'ezra': { name: 'Ezra', chapters: 10, testament: 'Old Testament', completedChapters: 0, description: 'Return and Rebuild — this book is coming soon to Bread&Light.' },
  'nehemiah': { name: 'Nehemiah', chapters: 13, testament: 'Old Testament', completedChapters: 0, description: 'Walls Restored — this book is coming soon to Bread&Light.' },
  'esther': { name: 'Esther', chapters: 10, testament: 'Old Testament', completedChapters: 0, description: 'For Such a Time as This — this book is coming soon to Bread&Light.' },
  'job': { name: 'Job', chapters: 42, testament: 'Old Testament', completedChapters: 0, description: 'Faith Through Suffering — this book is coming soon to Bread&Light.' },
  'psalms': { name: 'Psalms', chapters: 150, testament: 'Old Testament', completedChapters: 0, description: 'A collection of sacred poetry and hymns expressing the full range of human experience before God.' },
  'proverbs': { name: 'Proverbs', chapters: 31, testament: 'Old Testament', completedChapters: 0, description: 'Ancient wisdom literature offering practical guidance for living with integrity and understanding.' },
  'ecclesiastes': { name: 'Ecclesiastes', chapters: 12, testament: 'Old Testament', completedChapters: 0, description: 'Meaning Under the Sun — this book is coming soon to Bread&Light.' },
  'song-of-solomon': { name: 'Song of Solomon', chapters: 8, testament: 'Old Testament', completedChapters: 0, description: 'A Song of Love — this book is coming soon to Bread&Light.' },
  'isaiah': { name: 'Isaiah', chapters: 66, testament: 'Old Testament', completedChapters: 0, description: 'Judgment and Hope — this book is coming soon to Bread&Light.' },
  'jeremiah': { name: 'Jeremiah', chapters: 52, testament: 'Old Testament', completedChapters: 0, description: 'The Weeping Prophet — this book is coming soon to Bread&Light.' },
  'lamentations': { name: 'Lamentations', chapters: 5, testament: 'Old Testament', completedChapters: 0, description: 'Grief and Hope — this book is coming soon to Bread&Light.' },
  'ezekiel': { name: 'Ezekiel', chapters: 48, testament: 'Old Testament', completedChapters: 0, description: 'Visions by the River — this book is coming soon to Bread&Light.' },
  'daniel': { name: 'Daniel', chapters: 12, testament: 'Old Testament', completedChapters: 0, description: 'Faithful in Exile — this book is coming soon to Bread&Light.' },
  'hosea': { name: 'Hosea', chapters: 14, testament: 'Old Testament', completedChapters: 0, description: 'Unfailing Love — this book is coming soon to Bread&Light.' },
  'joel': { name: 'Joel', chapters: 3, testament: 'Old Testament', completedChapters: 0, description: 'The Day of the Lord — this book is coming soon to Bread&Light.' },
  'amos': { name: 'Amos', chapters: 9, testament: 'Old Testament', completedChapters: 0, description: 'A Cry for Justice — this book is coming soon to Bread&Light.' },
  'obadiah': { name: 'Obadiah', chapters: 1, testament: 'Old Testament', completedChapters: 0, description: 'Pride Brought Low — this book is coming soon to Bread&Light.' },
  'jonah': { name: 'Jonah', chapters: 4, testament: 'Old Testament', completedChapters: 0, description: 'Mercy for Nineveh — this book is coming soon to Bread&Light.' },
  'micah': { name: 'Micah', chapters: 7, testament: 'Old Testament', completedChapters: 0, description: 'What the Lord Requires — this book is coming soon to Bread&Light.' },
  'nahum': { name: 'Nahum', chapters: 3, testament: 'Old Testament', completedChapters: 0, description: 'Judgment on Nineveh — this book is coming soon to Bread&Light.' },
  'habakkuk': { name: 'Habakkuk', chapters: 3, testament: 'Old Testament', completedChapters: 0, description: 'Waiting on God — this book is coming soon to Bread&Light.' },
  'zephaniah': { name: 'Zephaniah', chapters: 3, testament: 'Old Testament', completedChapters: 0, description: 'A Day of Restoration — this book is coming soon to Bread&Light.' },
  'haggai': { name: 'Haggai', chapters: 2, testament: 'Old Testament', completedChapters: 0, description: 'Rebuild the House — this book is coming soon to Bread&Light.' },
  'zechariah': { name: 'Zechariah', chapters: 14, testament: 'Old Testament', completedChapters: 0, description: 'Visions of Hope — this book is coming soon to Bread&Light.' },
  'malachi': { name: 'Malachi', chapters: 4, testament: 'Old Testament', completedChapters: 0, description: 'A Call to Return — this book is coming soon to Bread&Light.' },
  'matthew': { name: 'Matthew', chapters: 28, testament: 'New Testament', completedChapters: 0, description: 'The Gospel presenting Jesus as the fulfillment of Jewish prophecy and the long-awaited Messiah.' },
  'mark': { name: 'Mark', chapters: 16, testament: 'New Testament', completedChapters: 0, description: 'The Kingdom in Action — this book is coming soon to Bread&Light.' },
  'luke': { name: 'Luke', chapters: 24, testament: 'New Testament', completedChapters: 0, description: 'Good News for All — this book is coming soon to Bread&Light.' },
  'john': { name: 'John', chapters: 21, testament: 'New Testament', completedChapters: 1, description: 'The Gospel of John presents Jesus as the eternal Word of God, emphasizing belief and eternal life.' },
  'acts': { name: 'Acts', chapters: 28, testament: 'New Testament', completedChapters: 0, description: 'The Spirit at Work — this book is coming soon to Bread&Light.' },
  'romans': { name: 'Romans', chapters: 16, testament: 'New Testament', completedChapters: 0, description: 'Paul\'s most systematic theological letter, exploring sin, salvation, grace, and the life of faith.' },
  '1-corinthians': { name: '1 Corinthians', chapters: 16, testament: 'New Testament', completedChapters: 0, description: 'Paul\'s letter addressing division, spiritual gifts, and Christian conduct in a complex urban church.' },
  '2-corinthians': { name: '2 Corinthians', chapters: 13, testament: 'New Testament', completedChapters: 0, description: 'Strength in Weakness — this book is coming soon to Bread&Light.' },
  'galatians': { name: 'Galatians', chapters: 6, testament: 'New Testament', completedChapters: 0, description: 'Freedom in Christ — this book is coming soon to Bread&Light.' },
  'ephesians': { name: 'Ephesians', chapters: 6, testament: 'New Testament', completedChapters: 0, description: 'One Body in Christ — this book is coming soon to Bread&Light.' },
  'philippians': { name: 'Philippians', chapters: 4, testament: 'New Testament', completedChapters: 0, description: 'Paul\'s joyful letter from prison, overflowing with gratitude, humility, and contentment in Christ.' },
  'colossians': { name: 'Colossians', chapters: 4, testament: 'New Testament', completedChapters: 0, description: 'Christ Above All — this book is coming soon to Bread&Light.' },
  '1-thessalonians': { name: '1 Thessalonians', chapters: 5, testament: 'New Testament', completedChapters: 0, description: 'Living in Hope — this book is coming soon to Bread&Light.' },
  '2-thessalonians': { name: '2 Thessalonians', chapters: 3, testament: 'New Testament', completedChapters: 0, description: 'Steadfast to the End — this book is coming soon to Bread&Light.' },
  '1-timothy': { name: '1 Timothy', chapters: 6, testament: 'New Testament', completedChapters: 0, description: 'A Faithful Shepherd — this book is coming soon to Bread&Light.' },
  '2-timothy': { name: '2 Timothy', chapters: 4, testament: 'New Testament', completedChapters: 0, description: 'Fight the Good Fight — this book is coming soon to Bread&Light.' },
  'titus': { name: 'Titus', chapters: 3, testament: 'New Testament', completedChapters: 0, description: 'Sound Doctrine, Good Works — this book is coming soon to Bread&Light.' },
  'philemon': { name: 'Philemon', chapters: 1, testament: 'New Testament', completedChapters: 0, description: 'A Plea for Reconciliation — this book is coming soon to Bread&Light.' },
  'hebrews': { name: 'Hebrews', chapters: 13, testament: 'New Testament', completedChapters: 0, description: 'A Better Covenant — this book is coming soon to Bread&Light.' },
  'james': { name: 'James', chapters: 5, testament: 'New Testament', completedChapters: 0, description: 'Faith in Action — this book is coming soon to Bread&Light.' },
  '1-peter': { name: '1 Peter', chapters: 5, testament: 'New Testament', completedChapters: 0, description: 'Hope Through Trials — this book is coming soon to Bread&Light.' },
  '2-peter': { name: '2 Peter', chapters: 3, testament: 'New Testament', completedChapters: 0, description: 'Guard the Truth — this book is coming soon to Bread&Light.' },
  '1-john': { name: '1 John', chapters: 5, testament: 'New Testament', completedChapters: 0, description: 'Walking in the Light — this book is coming soon to Bread&Light.' },
  '2-john': { name: '2 John', chapters: 1, testament: 'New Testament', completedChapters: 0, description: 'Truth and Love — this book is coming soon to Bread&Light.' },
  '3-john': { name: '3 John', chapters: 1, testament: 'New Testament', completedChapters: 0, description: 'Faithful Witness — this book is coming soon to Bread&Light.' },
  'jude': { name: 'Jude', chapters: 1, testament: 'New Testament', completedChapters: 0, description: 'Contend for the Faith — this book is coming soon to Bread&Light.' },
  'revelation': { name: 'Revelation', chapters: 22, testament: 'New Testament', completedChapters: 0, description: 'The King Returns — this book is coming soon to Bread&Light.' },
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
