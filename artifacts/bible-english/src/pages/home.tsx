import { Layout } from '../components/layout';
import { BookOpen, TrendingUp, CheckCircle, Clock, ChevronRight, Search, BookText, Bookmark, Feather } from 'lucide-react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';

const FEATURED_PASSAGES = [
  { book: "John 1", snippet: "In the beginning was the Word...", badge: "In Progress", bg: "bg-[#4A1C23]", text: "text-white/90", badgeClass: "bg-white/20 text-white", initial: "I" },
  { book: "Psalms 23", snippet: "The Lord is my shepherd...", badge: "Classic", bg: "bg-[#F3EFE9]", text: "text-[#2F2C2A]", badgeClass: "bg-black/5 text-[#2F2C2A]", initial: "XXIII" },
  { book: "Proverbs 3", snippet: "Trust in the Lord with all your heart...", badge: "Wisdom", bg: "bg-[#3B4231]", text: "text-[#F3EFE9]", badgeClass: "bg-white/20 text-[#F3EFE9]", initial: "III" },
  { book: "Matthew 5", snippet: "Blessed are the pure in heart...", badge: "Sermon", bg: "bg-[#C5A059]", text: "text-[#2F2C2A]", badgeClass: "bg-black/5 text-[#2F2C2A]", initial: "V" },
  { book: "Romans 8", snippet: "There is now no condemnation...", badge: "Grace", bg: "bg-[#2D3A4B]", text: "text-[#F3EFE9]", badgeClass: "bg-white/20 text-[#F3EFE9]", initial: "VIII" },
];

export default function HomePage() {
  return (
    <Layout>
      <div className="max-w-5xl mx-auto w-full p-8 md:p-12 overflow-y-auto">
        <header className="mb-12">
          <h1 className="font-serif text-4xl text-primary mb-2">Good morning, Wilson</h1>
          <p className="text-muted-foreground font-medium">Continue your journey</p>
        </header>

        <section className="mb-12">
          <div className="bg-card border border-border p-6 md:p-8 rounded-2xl shadow-sm relative overflow-hidden group">
            {/* Decorative background element */}
            <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-2">Current Study</p>
                <h2 className="font-serif text-3xl text-foreground mb-3">The Gospel of John</h2>
                <p className="text-sm text-muted-foreground max-w-md">
                  Chapter 1: "In the beginning was the Word, and the Word was with God..."
                </p>
              </div>
              
              <Link href="/" className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors shrink-0">
                Continue Reading
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="relative z-10 mt-8">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground mb-2">
                <span>Progress: Chapter 1 of 21</span>
                <span>4%</span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="bg-secondary h-full w-[4%]" />
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="bg-gradient-to-br from-card to-primary/5 border border-border p-8 md:p-10 rounded-2xl shadow-sm relative overflow-hidden group">
            <span className="absolute -top-4 -left-4 text-9xl font-serif text-primary/5 select-none pointer-events-none leading-none">"</span>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-4">Versículo do Dia</p>
                <h2 className="font-serif text-3xl md:text-4xl text-foreground leading-snug mb-2 max-w-2xl">
                  "In him was life; and the life was the light of men."
                </h2>
                <p className="text-muted-foreground font-serif italic text-lg">— John 1:4</p>
              </div>
              
              <Link href="/" className="inline-flex items-center justify-center gap-2 bg-transparent border border-primary/20 text-primary px-6 py-3 rounded-lg font-medium text-sm hover:bg-primary/5 transition-colors shrink-0">
                Read in Context
              </Link>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-serif text-2xl text-foreground">Featured Passages</h3>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide -mx-8 px-8 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
            {FEATURED_PASSAGES.map((card, i) => (
              <Link href="/" key={i} className="snap-start shrink-0 block">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`w-60 h-44 p-6 rounded-xl relative overflow-hidden cursor-pointer shadow-sm flex flex-col ${card.bg} ${card.text}`}
                >
                  <div className="absolute -bottom-4 -right-2 text-8xl font-serif opacity-10 pointer-events-none select-none">
                    {card.initial}
                  </div>
                  <div className="flex justify-between items-start mb-auto relative z-10">
                    <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-full ${card.badgeClass}`}>
                      {card.badge}
                    </span>
                  </div>
                  <div className="relative z-10 mt-auto">
                    <h4 className="font-serif text-xl mb-1">{card.book}</h4>
                    <p className="text-xs opacity-80 leading-relaxed font-sans line-clamp-2">
                      "{card.snippet}"
                    </p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h3 className="font-serif text-2xl text-foreground mb-6">Your Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              icon={BookOpen} 
              label="Words learned" 
              value="12" 
              trend="+3 today"
            />
            <StatCard 
              icon={CheckCircle} 
              label="Verses studied" 
              value="4" 
              trend="+1 today"
            />
            <StatCard 
              icon={Clock} 
              label="Study time" 
              value="18 min" 
              trend="This session"
            />
            <StatCard 
              icon={TrendingUp} 
              label="Daily streak" 
              value="7 days" 
              trend="Personal best!"
              highlight
            />
          </div>
        </section>

        <section>
          <h3 className="font-serif text-2xl text-foreground mb-5">Quick Access</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <QuickLink href="/search" icon={Search} label="Search" />
            <QuickLink href="/vocabulary" icon={BookText} label="Vocabulary" />
            <QuickLink href="/favorites" icon={Bookmark} label="Favorites" />
            <QuickLink href="/notes" icon={Feather} label="Notes" />
          </div>
        </section>

      </div>
    </Layout>
  );
}

function QuickLink({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2.5 p-5 bg-card border border-border rounded-xl hover:border-primary/30 hover:bg-primary/5 transition-all group"
    >
      <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
    </Link>
  );
}

function StatCard({ icon: Icon, label, value, trend, highlight = false }: { icon: any, label: string, value: string, trend: string, highlight?: boolean }) {
  return (
    <div className={`p-5 rounded-xl border ${highlight ? 'bg-secondary/5 border-secondary/20' : 'bg-background border-border shadow-2xs'}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${highlight ? 'bg-secondary/20 text-secondary' : 'bg-primary/10 text-primary'}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-baseline justify-between">
        <h4 className="font-serif text-3xl text-foreground">{value}</h4>
      </div>
      <p className={`text-xs mt-2 font-medium ${highlight ? 'text-secondary' : 'text-muted-foreground'}`}>{trend}</p>
    </div>
  );
}
