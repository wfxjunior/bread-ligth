import React from 'react';
import { Layout } from '../components/layout';
import { MOCK_NOTES } from '../data/mock';
import { Feather, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';

export default function NotesPage() {
  return (
    <Layout>
      <div className="max-w-5xl mx-auto w-full p-8 md:p-12 overflow-y-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl text-primary mb-2">Study Notes</h1>
            <p className="text-muted-foreground font-medium">Your personal reflections and insights</p>
          </div>
          
          <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
            <Feather className="w-4 h-4" />
            New Note
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_NOTES.map(note => (
            <div key={note.id} className="bg-card border border-border p-6 rounded-xl hover:shadow-md hover:border-primary/30 transition-all flex flex-col group relative">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex px-2 py-1 rounded bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-widest border border-secondary/20">
                  {note.reference}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  {note.date}
                </span>
              </div>
              
              <div className="flex-1">
                <p className="font-serif text-lg leading-relaxed text-foreground italic">
                  "{note.snippet}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs font-medium text-primary">Edit Note</span>
                <ArrowRight className="w-4 h-4 text-primary" />
              </div>
              <Link href="/" className="absolute inset-0 z-10" />
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
