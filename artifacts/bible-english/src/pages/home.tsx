import React from 'react';
import { Layout } from '../components/layout';
import { BookOpen, TrendingUp, CheckCircle, Clock, ChevronRight, Search, BookText, Bookmark, Feather } from 'lucide-react';
import { Link } from 'wouter';

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
