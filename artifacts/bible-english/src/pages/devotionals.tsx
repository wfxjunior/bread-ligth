import { useState } from 'react';
import { Layout } from '../components/layout';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, X, Search, Share2, Pencil, Trash2, ChevronRight } from 'lucide-react';

// ── Mock data ─────────────────────────────────────────────────────────────────
interface DevVerse { vid: number; ref: string; text: string; done: boolean; }
interface Devotional {
  id: number; title: string; desc: string; schedule: string;
  streak: number; streakUnit: string; active: boolean; verses: DevVerse[];
}

const INITIAL: Devotional[] = [
  {
    id: 1,
    title: 'Morning Reflection',
    desc: 'Start each day anchored in the Word.',
    schedule: 'Daily',
    streak: 5, streakUnit: 'days',
    active: true,
    verses: [
      { vid: 1, ref: 'John 1:1',    text: 'In the beginning was the Word, and the Word was with God, and the Word was God.', done: true  },
      { vid: 2, ref: 'John 1:4',    text: 'In him was life; and the life was the light of men.', done: true  },
      { vid: 3, ref: 'John 1:14',   text: 'And the Word was made flesh, and dwelt among us...', done: false },
      { vid: 4, ref: 'Psalms 23:1', text: 'The Lord is my shepherd; I shall not want.', done: false },
    ],
  },
  {
    id: 2,
    title: 'John Study Plan',
    desc: 'Read through the Gospel of John, one passage a week.',
    schedule: 'Weekly',
    streak: 2, streakUnit: 'weeks',
    active: true,
    verses: [
      { vid: 5, ref: 'John 1:1',  text: 'In the beginning was the Word, and the Word was with God, and the Word was God.', done: true },
      { vid: 6, ref: 'John 1:12', text: 'But as many as received him, to them gave he power to become the sons of God.', done: false },
      { vid: 7, ref: 'John 1:29', text: 'Behold the Lamb of God, which taketh away the sin of the world.', done: false },
    ],
  },
  {
    id: 3,
    title: 'Promises of God',
    desc: 'Twelve key promises to meditate on.',
    schedule: '3x per week',
    streak: 3, streakUnit: 'days',
    active: false,
    verses: [
      { vid: 8,  ref: 'John 3:16',    text: 'For God so loved the world, that he gave his only begotten Son...', done: false },
      { vid: 9,  ref: 'Romans 8:28',  text: 'And we know that all things work together for good to them that love God.', done: false },
      { vid: 10, ref: 'Romans 8:37',  text: 'In all these things we are more than conquerors through him that loved us.', done: false },
    ],
  },
];

let _nextVid = 100;

const SCHEDULES = ['Daily', '3x Week', 'Weekly', 'Custom'];

// ── Verse row ────────────────────────────────────────────────────────────────
function VerseRow({ v, onToggle, onRemove }: { v: DevVerse; onToggle: () => void; onRemove: () => void }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border/40 last:border-0 group">
      <button
        onClick={onToggle}
        aria-label="Mark as read"
        className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${v.done ? 'bg-secondary border-secondary' : 'border-border hover:border-secondary/60'}`}
      >
        {v.done && <Check className="w-3 h-3 text-white" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-secondary mb-0.5">{v.ref}</p>
        <p className={`text-sm leading-relaxed ${v.done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{v.text}</p>
      </div>
      <button onClick={onRemove} aria-label="Remove verse" className="shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function DevotionalsPage() {
  const [devs, setDevs]           = useState<Devotional[]>(INITIAL);
  const [selectedId, setSelectedId] = useState<number>(1);
  const [creating, setCreating]   = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [verseQuery, setVerseQuery] = useState('');
  const [showAddVerse, setShowAddVerse] = useState(false);

  // Creation state
  const [newTitle, setNewTitle]   = useState('');
  const [newDesc, setNewDesc]     = useState('');
  const [newSched, setNewSched]   = useState('Daily');

  const selected = devs.find(d => d.id === selectedId) ?? devs[0] ?? null;

  const toggleVerse = (devId: number, vid: number) =>
    setDevs(prev => prev.map(d => d.id === devId
      ? { ...d, verses: d.verses.map(v => v.vid === vid ? { ...v, done: !v.done } : v) }
      : d));

  const removeVerse = (devId: number, vid: number) =>
    setDevs(prev => prev.map(d => d.id === devId
      ? { ...d, verses: d.verses.filter(v => v.vid !== vid) }
      : d));

  const toggleActive = (id: number) =>
    setDevs(prev => prev.map(d => d.id === id ? { ...d, active: !d.active } : d));

  const createDev = () => {
    if (!newTitle.trim()) return;
    const newDev: Devotional = {
      id: Date.now(), title: newTitle, desc: newDesc,
      schedule: newSched, streak: 0, streakUnit: 'days', active: true, verses: [],
    };
    setDevs(prev => [...prev, newDev]);
    setSelectedId(newDev.id);
    setNewTitle(''); setNewDesc(''); setNewSched('Daily');
    setCreating(false);
  };

  const deleteDev = (id: number) => {
    setDevs(prev => {
      const next = prev.filter(d => d.id !== id);
      const nextSelected = next.find(d => d.id !== id) ?? next[0];
      setSelectedId(nextSelected?.id ?? 0);
      setCreating(next.length === 0);
      return next;
    });
  };

  const VERSE_SUGGESTIONS = [
    { ref: 'John 1:1',   text: 'In the beginning was the Word...' },
    { ref: 'Psalms 23:1', text: 'The Lord is my shepherd; I shall not want.' },
    { ref: 'John 1:14',  text: 'And the Word was made flesh, and dwelt among us...' },
    { ref: 'Romans 8:28', text: 'And we know that all things work together for good...' },
  ].filter(s => s.ref.toLowerCase().includes(verseQuery.toLowerCase()) || s.text.toLowerCase().includes(verseQuery.toLowerCase()));

  return (
    <Layout>
      <div className="flex h-full w-full overflow-hidden">

        {/* ── Left: List ── */}
        <aside className="w-72 shrink-0 border-r border-border bg-card/40 flex flex-col h-full">
          <div className="flex items-center justify-between px-5 py-5 border-b border-border/60">
            <h2 className="font-serif text-2xl text-primary">Devotionals</h2>
            <button
              onClick={() => { setCreating(true); setSelectedId(0); }}
              aria-label="New devotional"
              className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {devs.map(d => (
              <button
                key={d.id}
                onClick={() => { setSelectedId(d.id); setCreating(false); }}
                className={`w-full text-left p-4 rounded-xl border transition-all ${selectedId === d.id && !creating ? 'bg-primary/5 border-primary/20' : 'bg-background border-border/50 hover:border-primary/20 hover:bg-primary/5'}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className={`font-serif text-lg leading-tight ${selectedId === d.id && !creating ? 'text-primary' : 'text-foreground'}`}>{d.title}</p>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${d.active ? 'bg-secondary/10 text-secondary border border-secondary/30' : 'bg-muted text-muted-foreground border border-border'}`}>
                    {d.active ? 'Active' : 'Paused'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{d.verses.length} verses · {d.schedule}</p>
                <p className="text-xs text-secondary font-medium mt-1.5">● {d.streak} {d.streakUnit} streak</p>
              </button>
            ))}
          </div>
        </aside>

        {/* ── Right: Detail or Create ── */}
        <main className="flex-1 flex flex-col h-full overflow-hidden">
          <AnimatePresence mode="wait">

            {/* Creation panel */}
            {creating ? (
              <motion.div
                key="create"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="flex-1 overflow-y-auto"
              >
                <div className="max-w-xl mx-auto p-8 md:p-12">
                  <h2 className="font-serif text-4xl text-primary mb-2">New Devotional</h2>
                  <p className="text-muted-foreground mb-8">Create a personal study plan.</p>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Title</label>
                      <input
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        placeholder="Name your devotional..."
                        className="w-full bg-background border border-border rounded-lg px-4 py-3 font-serif text-xl text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Description</label>
                      <textarea
                        value={newDesc}
                        onChange={e => setNewDesc(e.target.value)}
                        placeholder="What is this devotional about?"
                        rows={3}
                        className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Schedule</label>
                      <div className="flex gap-2 flex-wrap">
                        {SCHEDULES.map(s => (
                          <button
                            key={s}
                            onClick={() => setNewSched(s)}
                            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${newSched === s ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border hover:bg-muted'}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Starting Verse</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          placeholder="Search John 1:1, Psalms 23..."
                          className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-border/40">
                      <button
                        onClick={createDev}
                        className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all"
                      >
                        Create Devotional
                      </button>
                      <button
                        onClick={() => setCreating(false)}
                        className="px-5 py-3 text-sm text-muted-foreground hover:text-foreground transition rounded-xl border border-border hover:bg-muted"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>

            ) : selected ? (
              // Detail panel
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex-1 overflow-y-auto"
              >
                <div className="max-w-2xl mx-auto p-8 md:p-12">

                  {/* Header */}
                  <div className="flex items-start justify-between mb-8">
                    <div>
                      <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${selected.active ? 'text-secondary' : 'text-muted-foreground'}`}>
                        {selected.active ? '● Active' : '○ Paused'} · {selected.schedule}
                      </p>
                      <h2 className="font-serif text-4xl text-primary mb-2">{selected.title}</h2>
                      <p className="text-muted-foreground text-sm">{selected.desc}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 mt-1">
                      <button aria-label="Edit" className="p-2 rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        aria-label="Share devotional"
                        onClick={() => setShowShare(v => !v)}
                        className="p-2 rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        aria-label="Delete devotional"
                        onClick={() => deleteDev(selected.id)}
                        className="p-2 rounded-lg border border-border hover:bg-destructive/10 hover:border-destructive/30 transition-colors text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Share preview */}
                  <AnimatePresence>
                    {showShare && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mb-6"
                      >
                        <div className="rounded-xl border border-border/60 p-5 mb-3" style={{ background: 'linear-gradient(135deg, #fbf9f6 0%, #f5efe6 100%)' }}>
                          <p className="font-serif text-xl text-primary mb-1">{selected.title}</p>
                          <p className="text-xs text-muted-foreground">{selected.verses.length} verses · {selected.schedule} · Bible English</p>
                        </div>
                        <button className="flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                          <Share2 className="w-3.5 h-3.5" /> Share this devotional
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    {[
                      { label: 'Streak', value: `${selected.streak} ${selected.streakUnit}` },
                      { label: 'Verses',  value: `${selected.verses.length} total` },
                      { label: 'Progress', value: `${Math.round((selected.verses.filter(v => v.done).length / Math.max(selected.verses.length, 1)) * 100)}%` },
                    ].map(s => (
                      <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
                        <p className="font-serif text-2xl text-foreground">{s.value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Schedule */}
                  <div className="bg-card border border-border rounded-2xl p-5 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Schedule</p>
                        <p className="font-serif text-xl text-foreground">{selected.schedule}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Next session: Tomorrow, 7:00 AM</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-medium px-3 py-1 rounded-full border ${selected.active ? 'bg-secondary/10 border-secondary/30 text-secondary' : 'bg-muted border-border text-muted-foreground'}`}>
                          {selected.active ? 'Active' : 'Paused'}
                        </span>
                        <button
                          onClick={() => toggleActive(selected.id)}
                          className="text-xs font-medium text-muted-foreground hover:text-foreground transition px-3 py-1 rounded-lg border border-border hover:bg-muted"
                        >
                          {selected.active ? 'Pause' : 'Resume'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Verse list */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Verses</h3>
                      <button
                        onClick={() => setShowAddVerse(v => !v)}
                        className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add verse
                      </button>
                    </div>

                    <AnimatePresence>
                      {showAddVerse && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden mb-4"
                        >
                          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <input
                                value={verseQuery}
                                onChange={e => setVerseQuery(e.target.value)}
                                placeholder="Search John 1:1, Psalms 23..."
                                className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                              />
                            </div>
                            {verseQuery && (
                              <div className="space-y-1">
                                {VERSE_SUGGESTIONS.map(s => (
                                  <button
                                    key={s.ref}
                                    onClick={() => {
                                      setDevs(prev => prev.map(d => d.id === selected.id
                                        ? { ...d, verses: [...d.verses, { vid: _nextVid++, ref: s.ref, text: s.text, done: false }] }
                                        : d));
                                      setVerseQuery(''); setShowAddVerse(false);
                                    }}
                                    className="w-full text-left flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-muted transition-colors"
                                  >
                                    <div>
                                      <p className="text-xs font-bold text-secondary">{s.ref}</p>
                                      <p className="text-xs text-muted-foreground truncate max-w-xs">{s.text}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="bg-card border border-border rounded-2xl px-5">
                      {selected.verses.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">No verses yet. Add one above.</p>
                      ) : (
                        selected.verses.map(v => (
                          <VerseRow
                            key={v.vid}
                            v={v}
                            onToggle={() => toggleVerse(selected.id, v.vid)}
                            onRemove={() => removeVerse(selected.id, v.vid)}
                          />
                        ))
                      )}
                    </div>
                  </div>

                </div>
              </motion.div>
            ) : null}

          </AnimatePresence>
        </main>
      </div>
    </Layout>
  );
}
