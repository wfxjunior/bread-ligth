import React from 'react';
import { Layout } from '../components/layout';
import { Flag, Trophy, Flame } from 'lucide-react';

export default function JourneyPage() {
  // Mock calendar data
  const days = Array.from({ length: 35 }).map((_, i) => {
    // Some random activity
    if (i > 25) return 0; // future
    if (i > 18) return 3; // streak!
    return Math.random() > 0.5 ? Math.floor(Math.random() * 4) : 0;
  });

  return (
    <Layout>
      <div className="max-w-5xl mx-auto w-full p-8 md:p-12 overflow-y-auto">
        <header className="mb-12">
          <h1 className="font-serif text-4xl text-primary mb-2">Your Journey</h1>
          <p className="text-muted-foreground font-medium">Tracking your consistency and growth</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-card border border-border p-6 rounded-xl flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-600">
              <Flame className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
              <h3 className="font-serif text-3xl text-foreground">7 Days</h3>
            </div>
          </div>
          
          <div className="bg-card border border-border p-6 rounded-xl flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Flag className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Chapters Read</p>
              <h3 className="font-serif text-3xl text-foreground">1 Chapter</h3>
            </div>
          </div>

          <div className="bg-card border border-border p-6 rounded-xl flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-secondary/20 flex items-center justify-center text-secondary-foreground">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Words Mastered</p>
              <h3 className="font-serif text-3xl text-foreground">12 Words</h3>
            </div>
          </div>
        </div>

        <section className="bg-card border border-border p-8 rounded-2xl mb-12">
          <h3 className="font-serif text-2xl text-foreground mb-6">Study Activity</h3>
          
          <div className="flex flex-wrap gap-2">
            {days.map((level, i) => (
              <div 
                key={i} 
                className={`w-8 h-8 rounded-sm ${
                  level === 0 ? 'bg-muted/50' : 
                  level === 1 ? 'bg-primary/20' : 
                  level === 2 ? 'bg-primary/50' : 
                  'bg-primary'
                }`}
                title={level > 0 ? 'Studied' : 'No activity'}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="w-3 h-3 rounded-sm bg-muted/50" />
            <div className="w-3 h-3 rounded-sm bg-primary/20" />
            <div className="w-3 h-3 rounded-sm bg-primary/50" />
            <div className="w-3 h-3 rounded-sm bg-primary" />
            <span>More</span>
          </div>
        </section>

      </div>
    </Layout>
  );
}
