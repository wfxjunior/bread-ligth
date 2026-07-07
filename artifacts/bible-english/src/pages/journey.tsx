import { Link } from 'wouter';
import { Layout } from '../components/layout';
import { motion } from 'framer-motion';
import {
  BookOpen, Brain, StickyNote, Bookmark, Flame, Clock,
  TrendingUp, ChevronRight, Circle,
} from 'lucide-react';
import { MOCK_NOTES, MOCK_FAVORITES, MOCK_VOCABULARY } from '../data/mock';

// ── Mock data ─────────────────────────────────────────────────────────────────
const STATS = [
  { label: 'Chapters Read',    value: '3',       unit: '',      icon: BookOpen, trend: '+1 this week' },
  { label: 'Words Learned',    value: '24',      unit: '',      icon: Brain,    trend: '+5 this week' },
  { label: 'Notes Written',    value: String(MOCK_NOTES.length),  unit: '', icon: StickyNote, trend: 'Across 1 book' },
  { label: 'Verses Saved',     value: String(MOCK_FAVORITES.length), unit: '', icon: Bookmark, trend: 'All from John' },
  { label: 'Day Streak',       value: '12',      unit: 'days',  icon: Flame,    trend: 'Personal best' },
  { label: 'Time Studied',     value: '3h 40m',  unit: '',      icon: Clock,    trend: 'This month' },
];

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEK_ACTIVITY = [
  { minutes: 22, words: 4, verses: 3 },
  { minutes: 0,  words: 0, verses: 0 },
  { minutes: 35, words: 8, verses: 6 },
  { minutes: 18, words: 3, verses: 4 },
  { minutes: 41, words: 6, verses: 9 },
  { minutes: 29, words: 3, verses: 5 },
  { minutes: 15, words: 2, verses: 2 },
];
const MAX_MIN = Math.max(...WEEK_ACTIVITY.map(d => d.minutes));

const BOOKS_PROGRESS = [
  { name: 'John',     nameEn: 'The Gospel of John',   chapters: 21, read: 3, testament: 'New',  color: '#6B1E2A' },
  { name: 'Genesis',  nameEn: 'Genesis',               chapters: 50, read: 1, testament: 'Old',  color: '#1E4D2B' },
  { name: 'Psalms',   nameEn: 'Psalms',                chapters: 150, read: 1, testament: 'Old', color: '#7A5218' },
  { name: 'Matthew',  nameEn: 'Matthew',               chapters: 28, read: 0, testament: 'New',  color: '#3E141D' },
  { name: 'Romans',   nameEn: 'Romans',                chapters: 16, read: 0, testament: 'New',  color: '#2D3A4B' },
];

const MONTHS = [
  { label: 'Aug', days: [0,1,0,2,3,2,0, 0,1,1,0,2,3,3, 0,0,1,2,3,2,1, 0,1,0,0,2,3,0, 0,1,0] },
  { label: 'Sep', days: [0,0,2,3,2,1,0, 1,2,3,3,2,1,0, 0,1,2,3,3,2,0, 1,2,3,2,1,0,0, 1,2,3, 0] },
  { label: 'Oct', days: [2,3,3,2,1,0,1, 2,3,3,2,1,0,0, 1,2,3,3,2,1,0, 0,1,2,3,3,2,1, 0,0,1,2] },
  { label: 'Nov', days: [3,2,1,0,0,1,2, 3,3,2,1,0,0,1, 2,3,3,2,1,0,0, 1,2,3,0,0,0,0, 0,0,0] },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1], delay },
});

const LEVEL_BG: Record<number, string> = {
  0: 'bg-border/60',
  1: 'bg-primary/25',
  2: 'bg-primary/55',
  3: 'bg-primary',
};

export default function JourneyPage() {
  const mastered  = MOCK_VOCABULARY.filter(v => v.status === 'Mastered').length;
  const totalW    = MOCK_VOCABULARY.length;
  const masteredPct = Math.round((mastered / totalW) * 100);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto w-full px-8 md:px-12 py-10 overflow-y-auto space-y-14">

        {/* ── Header ── */}
        <motion.header {...fade(0)}>
          <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-2">Your Record</p>
          <h1 className="font-serif text-4xl md:text-5xl text-primary leading-tight mb-3">
            Your Journey
          </h1>
          <p className="text-muted-foreground text-lg">
            A record of your growth. Consistency compounds.
          </p>
        </motion.header>

        {/* ── 6-stat grid ── */}
        <motion.section {...fade(0.05)}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="bg-card border border-border rounded-2xl p-6"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="p-2 rounded-lg bg-primary/8">
                    <s.icon className="w-4 h-4 text-primary" />
                  </div>
                  {s.label === 'Day Streak' && (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
                      Best
                    </span>
                  )}
                </div>
                <p className="font-serif text-4xl text-foreground leading-none mb-1">
                  {s.value}
                  {s.unit && <span className="text-xl text-muted-foreground font-sans ml-1">{s.unit}</span>}
                </p>
                <p className="text-xs font-medium text-muted-foreground mt-2">{s.label}</p>
                <p className="text-[11px] text-secondary mt-1">{s.trend}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Vocabulary mastery ── */}
        <motion.section {...fade(0.15)}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif text-2xl text-foreground">Vocabulary Mastery</h2>
            <Link href="/vocabulary" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-card border border-border rounded-2xl p-8">
            {/* Overall bar */}
            <div className="mb-8">
              <div className="flex items-baseline justify-between mb-3">
                <p className="text-sm font-medium text-foreground">{totalW} words encountered</p>
                <p className="font-serif text-3xl text-primary">{masteredPct}%<span className="text-sm text-muted-foreground font-sans ml-1">mastered</span></p>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${masteredPct}%` }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                />
              </div>
            </div>

            {/* Status breakdown */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Mastered', count: MOCK_VOCABULARY.filter(v => v.status === 'Mastered').length, color: 'text-primary', dot: 'bg-primary' },
                { label: 'Learning', count: MOCK_VOCABULARY.filter(v => v.status === 'Learning').length, color: 'text-secondary', dot: 'bg-secondary' },
                { label: 'New',      count: MOCK_VOCABULARY.filter(v => v.status === 'New').length,      color: 'text-muted-foreground', dot: 'bg-border' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <p className={`font-serif text-3xl ${s.color}`}>{s.count}</p>
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ── This Week ── */}
        <motion.section {...fade(0.2)}>
          <h2 className="font-serif text-2xl text-foreground mb-5">This Week</h2>

          <div className="bg-card border border-border rounded-2xl p-8">
            <div className="flex items-end justify-between gap-3">
              {WEEK_ACTIVITY.map((day, i) => {
                const pct = MAX_MIN > 0 ? day.minutes / MAX_MIN : 0;
                const isToday = i === 4;
                return (
                  <div key={i} className="flex flex-col items-center gap-2 flex-1">
                    {/* Minute label on hover-ish */}
                    <p className="text-[10px] text-muted-foreground h-3">
                      {day.minutes > 0 ? `${day.minutes}m` : ''}
                    </p>
                    {/* Bar */}
                    <div className="w-full bg-muted/60 rounded-sm overflow-hidden" style={{ height: 80 }}>
                      <motion.div
                        className={`w-full rounded-sm ${isToday ? 'bg-secondary' : 'bg-primary/70'}`}
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(pct * 100, day.minutes > 0 ? 6 : 0)}%` }}
                        transition={{ delay: 0.25 + i * 0.04, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        style={{ marginTop: 'auto', position: 'absolute', bottom: 0 }}
                      />
                      {/* Re-implement without absolute — simple approach */}
                      <div className="h-full flex items-end">
                        <motion.div
                          className={`w-full rounded-sm ${isToday ? 'bg-secondary' : 'bg-primary/70'}`}
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(pct * 100, day.minutes > 0 ? 6 : 0)}%` }}
                          transition={{ delay: 0.25 + i * 0.04, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </div>
                    </div>
                    <p className={`text-[10px] font-medium ${isToday ? 'text-secondary font-bold' : 'text-muted-foreground'}`}>
                      {WEEK_DAYS[i]}
                    </p>
                    {/* Dot for words */}
                    {day.words > 0 && (
                      <div className="flex gap-0.5">
                        {Array.from({ length: Math.min(day.words, 5) }).map((_, j) => (
                          <div key={j} className="w-1 h-1 rounded-full bg-accent" />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-5 mt-6 pt-5 border-t border-border/40 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-primary/70" />
                Study time
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                Words learned
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-secondary" />
                Today
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── Books Progress ── */}
        <motion.section {...fade(0.25)}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif text-2xl text-foreground">Books</h2>
            <Link href="/library" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
              Library <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {BOOKS_PROGRESS.map((b, i) => {
              const pct = Math.round((b.read / b.chapters) * 100);
              return (
                <motion.div
                  key={b.name}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-card border border-border rounded-xl p-5 flex items-center gap-5"
                >
                  {/* Color strip */}
                  <div className="w-1 self-stretch rounded-full shrink-0" style={{ backgroundColor: b.color }} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between mb-2.5">
                      <div>
                        <span className="font-serif text-lg text-foreground">{b.nameEn}</span>
                        <span className="text-xs text-muted-foreground ml-2">{b.testament} Testament</span>
                      </div>
                      <span className="text-xs font-medium text-muted-foreground shrink-0 ml-4">
                        {b.read}/{b.chapters} ch.
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: b.color }}
                        initial={{ width: 0 }}
                        animate={{ width: pct > 0 ? `${Math.max(pct, 3)}%` : '0%' }}
                        transition={{ delay: 0.35 + i * 0.07, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    {pct > 0 ? (
                      <>
                        <p className="font-serif text-2xl text-foreground">{pct}%</p>
                        <p className="text-[10px] text-muted-foreground">complete</p>
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">Not started</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* ── Activity Heatmap ── */}
        <motion.section {...fade(0.3)}>
          <h2 className="font-serif text-2xl text-foreground mb-5">Study Activity</h2>

          <div className="bg-card border border-border rounded-2xl p-8 overflow-x-auto">
            <div className="flex gap-3 min-w-max">
              {MONTHS.map(month => (
                <div key={month.label} className="flex flex-col gap-1.5">
                  <p className="text-[10px] text-muted-foreground font-medium mb-0.5">{month.label}</p>
                  <div className="grid grid-cols-5 gap-1">
                    {month.days.map((level, j) => (
                      <div
                        key={j}
                        className={`w-3.5 h-3.5 rounded-sm transition-colors ${LEVEL_BG[level]}`}
                        title={level > 0 ? `Level ${level}` : 'No activity'}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-5 text-[10px] text-muted-foreground">
              <span>Less</span>
              {[0, 1, 2, 3].map(l => (
                <div key={l} className={`w-3 h-3 rounded-sm ${LEVEL_BG[l]}`} />
              ))}
              <span>More</span>
            </div>
          </div>
        </motion.section>

        {/* ── Recent Notes & Favorites ── */}
        <motion.section {...fade(0.35)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Notes */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-xl text-foreground">Recent Notes</h2>
                <Link href="/notes" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                  All notes <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-3">
                {MOCK_NOTES.slice(0, 3).map(note => (
                  <div key={note.id} className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Circle className="w-2 h-2 fill-secondary text-secondary shrink-0" />
                      <span className="text-xs font-bold text-secondary">{note.reference}</span>
                      <span className="text-[10px] text-muted-foreground ml-auto">{note.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{note.snippet}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Favorites */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-xl text-foreground">Saved Verses</h2>
                <Link href="/favorites" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                  All favorites <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-3">
                {MOCK_FAVORITES.slice(0, 3).map(fav => (
                  <div key={fav.id} className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Bookmark className="w-3 h-3 fill-primary text-primary shrink-0" />
                      <span className="text-xs font-bold text-primary">{fav.reference}</span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed font-serif italic line-clamp-2">"{fav.text}"</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </motion.section>

        {/* ── Overall Progress ── */}
        <motion.section {...fade(0.4)}>
          <div className="bg-gradient-to-br from-primary/5 via-card to-card border border-primary/15 rounded-2xl p-8 md:p-10 relative overflow-hidden">
            {/* Decorative serif quote mark */}
            <span className="absolute -top-4 -left-2 font-serif text-[10rem] text-primary/4 leading-none select-none pointer-events-none">"</span>

            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-4">Overall Progress</p>
              <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-2 leading-snug">
                Every word you learn<br />
                is a step toward fluency.
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md">
                You've been consistent for 12 days. Keep reading. Keep noting. The language will open.
              </p>

              <div className="grid grid-cols-3 gap-6 text-center">
                {[
                  { label: 'Overall Completion', value: '2%', sub: '3 of 150 chapters' },
                  { label: 'Vocabulary Built',   value: `${totalW}`, sub: 'words encountered' },
                  { label: 'Study Sessions',     value: '18', sub: 'sessions logged' },
                ].map(s => (
                  <div key={s.label}>
                    <p className="font-serif text-4xl text-primary mb-1">{s.value}</p>
                    <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
                    <p className="text-[11px] text-muted-foreground/70 mt-0.5">{s.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

      </div>
    </Layout>
  );
}
