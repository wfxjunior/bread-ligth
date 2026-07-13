import { useState, type ReactNode } from 'react';
import { Layout } from '../components/layout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Palette, BookOpen, Globe, Share2, BookHeart, Crown,
  Check, Lock, Copy, ChevronRight, Mail, Pencil, Plus,
} from 'lucide-react';
import { useReadingSpace } from '../context/reading-space-context';
import { READING_SPACES, READING_SPACE_ORDER, gradientCss } from '../lib/reading-spaces';

// ── Reusable Toggle ─────────────────────────────────────────────────────────
function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      aria-label={on ? 'Turn off' : 'Turn on'}
      className={`relative shrink-0 w-10 h-[22px] rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 ${on ? 'bg-primary' : 'bg-border'}`}
    >
      <motion.div
        animate={{ x: on ? 20 : 2 }}
        transition={{ type: 'spring', stiffness: 700, damping: 32 }}
        className="absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white shadow-sm"
      />
    </button>
  );
}

// ── Toggle Row ───────────────────────────────────────────────────────────────
function ToggleRow({ label, sub, on, onChange }: { label: string; sub?: string; on: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border/40 last:border-0">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      <Toggle on={on} onChange={onChange} />
    </div>
  );
}

// ── Section heading ──────────────────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-5">{children}</h3>;
}

// ── Tabs config ──────────────────────────────────────────────────────────────
const TABS = [
  { id: 'profile',      label: 'Profile',        icon: User },
  { id: 'appearance',   label: 'Appearance',      icon: Palette },
  { id: 'reading',      label: 'Reading',         icon: BookOpen },
  { id: 'language',     label: 'Language',        icon: Globe },
  { id: 'share',        label: 'Share & Invite',  icon: Share2 },
  { id: 'devotionals',  label: 'Devotionals',     icon: BookHeart },
  { id: 'plan',         label: 'Plan & Billing',  icon: Crown },
];

const THEMES = [
  { id: 'classic',  name: 'Classic Parchment', desc: 'Warm, easy on the eyes',   bg: '#fbf9f6', dark: false },
  { id: 'oxford',   name: 'Oxford Paper',      desc: 'Crisp white, high contrast', bg: '#ffffff', dark: false },
  { id: 'scholar',  name: 'Scholar',           desc: 'Muted tones, focused',      bg: '#f1f0ed', dark: false },
  { id: 'night',    name: 'Night Study',       desc: 'Dark mode for evening',     bg: '#1a1a24', dark: true  },
  { id: 'notebook', name: 'Study Notebook',    desc: 'Ruled lines, casual',       bg: '#fdfaf5', dark: false },
];

const ACCENT_COLORS = [
  { id: 'burgundy', hex: '#6B1E2A', label: 'Burgundy', free: true  },
  { id: 'blue',     hex: '#1E3A6B', label: 'Royal Blue', free: false },
  { id: 'green',    hex: '#1E4D2B', label: 'Forest',     free: false },
  { id: 'slate',    hex: '#3D4A5C', label: 'Slate',      free: false },
  { id: 'violet',   hex: '#3B1E6B', label: 'Violet',     free: false },
  { id: 'amber',    hex: '#7A5C1E', label: 'Amber',      free: false },
];

const MOCK_DEVOTIONALS_SETTINGS = [
  { id: 1, title: 'Morning Reflection',  verses: 7,  schedule: 'Daily',      active: true  },
  { id: 2, title: 'John Study Plan',     verses: 14, schedule: 'Weekly',     active: true  },
  { id: 3, title: 'Promises of God',     verses: 12, schedule: '3x per week', active: false },
];

// ── Main component ───────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  // Profile
  const [name, setName]   = useState('Wilson');
  const [email, setEmail] = useState('wilson@email.com');

  // Appearance
  const [theme, setTheme]   = useState('classic');
  const [accent, setAccent] = useState('burgundy');
  const { readingSpace, setReadingSpace } = useReadingSpace();

  // Reading toggles
  const [lastPos,    setLastPos]    = useState(true);
  const [autoVocab,  setAutoVocab]  = useState(true);
  const [verseNums,  setVerseNums]  = useState(true);
  const [readTime,   setReadTime]   = useState(false);
  const [readMode,   setReadMode]   = useState('Bilingual');

  // Language toggles
  const [ipa,     setIpa]     = useState(true);
  const [autoTr,  setAutoTr]  = useState(true);
  const [grammar, setGrammar] = useState(true);
  const [reminder, setReminder] = useState(false);
  const [level,   setLevel]   = useState('Intermediate');
  const [dailyGoal, setDailyGoal] = useState('5');

  // Share
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const handleCopy = (text: string, setter: (v: boolean) => void) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  // Devotionals tab
  const [devs, setDevs] = useState(MOCK_DEVOTIONALS_SETTINGS);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle]     = useState('');
  const [newSched, setNewSched]     = useState('Daily');

  // Plan
  const [waitlistJoined, setWaitlistJoined] = useState(false);

  const content: Record<string, ReactNode> = {

    // ── Profile ──────────────────────────────────────────────────────────────
    profile: (
      <div className="space-y-8">
        <div>
          <SectionTitle>Your Account</SectionTitle>
          <div className="bg-card border border-border rounded-2xl p-8">
            <div className="flex flex-col items-center mb-8">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <span className="font-serif italic text-4xl text-primary">W</span>
              </div>
              <button className="text-xs text-muted-foreground hover:text-primary transition-colors">Change photo</button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Name</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Email</label>
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Learning</label>
                <div className="bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground">
                  Português → English
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/40">
                <span>Member since January 2024</span>
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-muted border border-border text-muted-foreground font-medium">Free Plan</span>
                  <button onClick={() => setActiveTab('plan')} className="text-primary hover:underline font-medium">Upgrade</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),

    // ── Appearance ───────────────────────────────────────────────────────────
    appearance: (
      <div className="space-y-10">
        <div>
          <SectionTitle>Reading Theme</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {THEMES.map(t => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`relative p-0 rounded-xl text-left border-2 overflow-hidden transition-all ${theme === t.id ? 'border-primary' : 'border-border hover:border-primary/30'}`}
              >
                {theme === t.id && (
                  <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center z-10">
                    <Check className="w-3 h-3 text-white" />
                  </span>
                )}
                <div className="w-full h-20" style={{ background: t.bg }}>
                  <div className="p-3 space-y-1.5">
                    <div className={`w-3/4 h-1.5 rounded-full ${t.dark ? 'bg-white/20' : 'bg-black/15'}`} />
                    <div className={`w-full h-1.5 rounded-full ${t.dark ? 'bg-white/10' : 'bg-black/8'}`} />
                    <div className={`w-5/6 h-1.5 rounded-full ${t.dark ? 'bg-white/10' : 'bg-black/8'}`} />
                  </div>
                </div>
                <div className="p-3">
                  <p className="font-serif font-medium text-foreground text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <SectionTitle>Accent Color <span className="normal-case font-normal text-secondary ml-2">· Premium</span></SectionTitle>
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-4 flex-wrap">
              {ACCENT_COLORS.map(c => (
                <div key={c.id} className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => c.free && setAccent(c.id)}
                    title={c.free ? c.label : 'Premium feature'}
                    className="relative w-10 h-10 rounded-full border-2 transition-all focus:outline-none"
                    style={{
                      background: c.hex,
                      borderColor: accent === c.id ? c.hex : 'transparent',
                      outline: accent === c.id ? `3px solid ${c.hex}30` : undefined,
                      outlineOffset: '2px',
                    }}
                  >
                    {!c.free && (
                      <span className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center">
                        <Lock className="w-3 h-3 text-white/80" />
                      </span>
                    )}
                    {c.free && accent === c.id && (
                      <span className="absolute inset-0 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </span>
                    )}
                  </button>
                  <span className="text-[10px] text-muted-foreground">{c.label}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1.5">
              <Lock className="w-3 h-3" /> Custom colors unlock with Premium. <button onClick={() => setActiveTab('plan')} className="text-primary hover:underline">Learn more</button>
            </p>
          </div>
        </div>

        <div>
          <SectionTitle>Reading Space</SectionTitle>
          <p className="text-sm text-muted-foreground -mt-3 mb-4">
            A calm background mood for your Home, Reader, and Devotionals — independent of your reading theme.
          </p>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
            {READING_SPACE_ORDER.map(id => {
              const s = READING_SPACES[id];
              const active = readingSpace === id;
              return (
                <button
                  key={id}
                  onClick={() => setReadingSpace(id)}
                  className={`shrink-0 w-24 rounded-xl border-2 overflow-hidden text-left transition-all ${active ? '' : 'border-border hover:border-primary/30'}`}
                  style={active ? { borderColor: s.accent } : undefined}
                >
                  <div className="w-full h-14 relative" style={{ background: gradientCss(s.gradient) }}>
                    {active && (
                      <span
                        className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ background: s.accent }}
                      >
                        <Check className="w-2.5 h-2.5 text-white" />
                      </span>
                    )}
                  </div>
                  <div className="px-2.5 py-2">
                    <p className="text-xs font-medium text-foreground">{s.label}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    ),

    // ── Reading ───────────────────────────────────────────────────────────────
    reading: (
      <div className="space-y-8">
        <div>
          <SectionTitle>Display Mode</SectionTitle>
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center p-1 bg-muted rounded-lg border border-border/50 w-fit">
              {['English Only', 'Bilingual', 'Study Mode'].map(m => (
                <button
                  key={m}
                  onClick={() => setReadMode(m)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${readMode === m ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <SectionTitle>Typography</SectionTitle>
          <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
            {[
              { label: 'Font Size', value: 'Medium', min: 1, max: 5, def: 3 },
              { label: 'Line Height', value: 'Relaxed', min: 1, max: 3, def: 2 },
              { label: 'Audio Speed', value: '0.8× (Slower)', min: 5, max: 15, def: 8 },
            ].map(s => (
              <div key={s.label}>
                <label className="flex justify-between text-sm font-medium text-foreground mb-3">
                  <span>{s.label}</span><span className="text-muted-foreground">{s.value}</span>
                </label>
                <input type="range" min={s.min} max={s.max} defaultValue={s.def} className="w-full accent-primary h-1.5 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionTitle>Preferences</SectionTitle>
          <div className="bg-card border border-border rounded-2xl px-6">
            <ToggleRow label="Resume at last position" sub="Open where you left off" on={lastPos} onChange={() => setLastPos(v => !v)} />
            <ToggleRow label="Highlight saved vocabulary" sub="Underline words you've saved" on={autoVocab} onChange={() => setAutoVocab(v => !v)} />
            <ToggleRow label="Show verse numbers" on={verseNums} onChange={() => setVerseNums(v => !v)} />
            <ToggleRow label="Show reading time estimate" on={readTime} onChange={() => setReadTime(v => !v)} />
          </div>
        </div>
      </div>
    ),

    // ── Language ──────────────────────────────────────────────────────────────
    language: (
      <div className="space-y-8">
        <div>
          <SectionTitle>English Level</SectionTitle>
          <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
            <div>
              <div className="flex gap-2 mb-3">
                {['Beginner', 'Intermediate', 'Advanced'].map(l => (
                  <button
                    key={l}
                    onClick={() => setLevel(l)}
                    className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all ${level === l ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-foreground border-border hover:bg-muted'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Controls the depth of grammar explanations and how much vocabulary is automatically highlighted.</p>
            </div>
          </div>
        </div>

        <div>
          <SectionTitle>Daily Vocabulary Goal</SectionTitle>
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex gap-2">
              {['3', '5', '10', '15', '20'].map(n => (
                <button
                  key={n}
                  onClick={() => setDailyGoal(n)}
                  className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all ${dailyGoal === n ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-foreground border-border hover:bg-muted'}`}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">words per day</p>
          </div>
        </div>

        <div>
          <SectionTitle>Word Study</SectionTitle>
          <div className="bg-card border border-border rounded-2xl px-6">
            <ToggleRow label="Show pronunciation (IPA)" sub="Display phonetic spelling when tapping words" on={ipa} onChange={() => setIpa(v => !v)} />
            <ToggleRow label="Auto-translate tapped words" on={autoTr} onChange={() => setAutoTr(v => !v)} />
            <ToggleRow label="Show grammar notes" on={grammar} onChange={() => setGrammar(v => !v)} />
            <ToggleRow label="Daily vocabulary reminder" sub="Get a notification to review your words" on={reminder} onChange={() => setReminder(v => !v)} />
          </div>
        </div>
      </div>
    ),

    // ── Share & Invite ────────────────────────────────────────────────────────
    share: (
      <div className="space-y-10">
        <div>
          <SectionTitle>Share a Verse</SectionTitle>
          <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
            {/* Verse preview card */}
            <div className="rounded-xl overflow-hidden border border-border/60" style={{ background: 'linear-gradient(135deg, #fbf9f6 0%, #f5efe6 100%)' }}>
              <div className="p-8">
                <div className="text-5xl font-serif text-primary/15 leading-none mb-2">"</div>
                <p className="font-serif text-xl leading-relaxed text-foreground mb-4">
                  In the beginning was the Word, and the Word was with God, and the Word was God.
                </p>
                <p className="text-sm font-medium text-secondary">— John 1:1</p>
              </div>
              <div className="px-8 py-3 border-t border-border/30 flex items-center justify-between">
                <span className="font-serif text-sm text-muted-foreground">Bible English</span>
                <span className="text-xs text-muted-foreground">bibleenglish.app</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleCopy('In the beginning was the Word... — John 1:1 | Bible English', setCopied)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all ${copied ? 'bg-secondary/10 border-secondary/30 text-secondary' : 'bg-background border-border hover:bg-muted'}`}
              >
                <Copy className="w-4 h-4" />
                {copied ? 'Copied!' : 'Copy Text'}
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted transition-all">
                <Share2 className="w-4 h-4" />
                Share Image
              </button>
            </div>
          </div>
        </div>

        <div>
          <SectionTitle>Invite a Friend</SectionTitle>
          <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
            <p className="text-sm text-muted-foreground">Each friend you invite gets <span className="text-secondary font-medium">30 days of Premium free</span>.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="friend@email.com"
                className="flex-1 bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition"
              />
              <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all">
                <Mail className="w-4 h-4" /> Send
              </button>
            </div>
            <div className="pt-4 border-t border-border/40">
              <p className="text-xs text-muted-foreground mb-2">Your invite link</p>
              <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2">
                <span className="flex-1 text-sm text-muted-foreground font-mono truncate">bibleenglish.app/invite/wilson</span>
                <button onClick={() => handleCopy('bibleenglish.app/invite/wilson', setLinkCopied)} className="shrink-0">
                  {linkCopied ? <Check className="w-4 h-4 text-secondary" /> : <Copy className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),

    // ── Devotionals tab ───────────────────────────────────────────────────────
    devotionals: (
      <div className="space-y-6">
        <div>
          <SectionTitle>My Devotionals</SectionTitle>
          <div className="space-y-3">
            {devs.map(d => (
              <div key={d.id} className="bg-card border border-border rounded-xl p-5 flex items-center justify-between">
                <div>
                  <p className="font-serif text-lg text-foreground">{d.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{d.verses} verses · {d.schedule}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${d.active ? 'bg-secondary/10 border-secondary/30 text-secondary' : 'bg-muted border-border text-muted-foreground'}`}>
                    {d.active ? 'Active' : 'Paused'}
                  </span>
                  <Toggle on={d.active} onChange={() => setDevs(prev => prev.map(x => x.id === d.id ? { ...x, active: !x.active } : x))} />
                  <button aria-label="Edit" className="text-muted-foreground hover:text-foreground transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {showCreate ? (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-card border border-primary/20 rounded-2xl p-6 space-y-4"
            >
              <h4 className="font-serif text-xl text-foreground">New Devotional</h4>
              <input
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Name your devotional..."
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm font-serif text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
              />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Schedule</p>
                <div className="flex gap-2">
                  {['Daily', '3x Week', 'Weekly'].map(s => (
                    <button
                      key={s}
                      onClick={() => setNewSched(s)}
                      className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-all ${newSched === s ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border hover:bg-muted'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    if (newTitle.trim()) {
                      setDevs(prev => [...prev, { id: Date.now(), title: newTitle, verses: 0, schedule: newSched, active: true }]);
                      setNewTitle(''); setShowCreate(false);
                    }
                  }}
                  className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition"
                >
                  Create Devotional
                </button>
                <button onClick={() => setShowCreate(false)} className="px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition">Cancel</button>
              </div>
            </motion.div>
          ) : (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setShowCreate(true)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-dashed border-border hover:border-primary/40 hover:bg-primary/5 text-muted-foreground hover:text-primary text-sm font-medium transition-all"
            >
              <Plus className="w-4 h-4" /> Create New Devotional
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    ),

    // ── Plan & Billing ────────────────────────────────────────────────────────
    plan: (
      <div className="space-y-8">
        {/* Current */}
        <div className="bg-card border border-border rounded-2xl p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Current Plan</p>
            <p className="font-serif text-2xl text-foreground">Free</p>
            <p className="text-sm text-muted-foreground mt-1">You're studying the Bible and learning English for free.</p>
          </div>
          <span className="px-4 py-1.5 rounded-full bg-muted border border-border text-sm font-medium text-muted-foreground">Free Plan</span>
        </div>

        {/* Premium card */}
        <div className="relative rounded-2xl overflow-hidden border border-primary/20">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
          <div className="relative p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-1">Upgrade</p>
                <h3 className="font-serif text-3xl text-foreground">Bible English Premium</h3>
                <p className="text-muted-foreground text-sm mt-1">Cancel anytime. No ads. Ever.</p>
              </div>
              <div className="text-right">
                <div className="flex items-baseline gap-1">
                  <span className="font-serif text-4xl text-primary">$4.99</span>
                  <span className="text-muted-foreground text-sm">/month</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {[
                'Unlock all 66 books',
                'Custom accent colors',
                'Unlimited devotionals',
                'Share verse cards',
                'Export highlights & notes',
                'Audio playback (all chapters)',
                'Advanced grammar explanations',
                'Priority new features',
              ].map(f => (
                <div key={f} className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-secondary/20 border border-secondary/40 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-secondary" />
                  </div>
                  <span className="text-sm text-foreground">{f}</span>
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {waitlistJoined ? (
                <motion.div
                  key="joined"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full py-3.5 rounded-xl bg-secondary/10 border border-secondary/30 text-center"
                >
                  <p className="text-sm font-medium text-secondary flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" /> You're on the list! We'll notify you at {email}
                  </p>
                </motion.div>
              ) : (
                <motion.button
                  key="cta"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setWaitlistJoined(true)}
                  className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                >
                  <Crown className="w-4 h-4" /> Join the Waitlist
                </motion.button>
              )}
            </AnimatePresence>

            <p className="text-center text-xs text-muted-foreground mt-4">Currently in private beta — launching soon</p>
          </div>
        </div>

        {/* Always free */}
        <div className="bg-card border border-border/50 rounded-2xl p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Always Free, Forever</p>
          <p className="text-sm text-foreground leading-relaxed">
            John, Psalms, Proverbs, Genesis, Matthew, Romans — always free. Personal notes, bookmarks, vocabulary, word translations — always free.
          </p>
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <ChevronRight className="w-3 h-3" /> No credit card required to start
          </p>
        </div>
      </div>
    ),
  };

  return (
    <Layout>
      <div className="flex h-full w-full overflow-hidden">

        {/* Left tab nav */}
        <aside className="w-52 shrink-0 border-r border-border bg-card/50 overflow-y-auto">
          <div className="p-4 pt-6">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 px-3">Settings</p>
            <nav className="space-y-0.5">
              {TABS.map(tab => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${active ? 'bg-primary/8 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-primary' : 'opacity-60'}`} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Right content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto p-8 md:p-12">
            <header className="mb-10">
              <h1 className="font-serif text-4xl text-primary mb-1">
                {TABS.find(t => t.id === activeTab)?.label}
              </h1>
            </header>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                {content[activeTab]}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

      </div>
    </Layout>
  );
}
