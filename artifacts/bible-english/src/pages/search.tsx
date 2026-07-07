import React from 'react';
import { Layout } from '../components/layout';
import { Search as SearchIcon, Tag } from 'lucide-react';

const SUGGESTIONS = [
  "Grace", "Faith", "Fear not", "Kingdom of God", 
  "Present Perfect", "David", "Forgiveness"
];

export default function SearchPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto w-full p-8 md:p-12 overflow-y-auto">
        <div className="relative mb-12 mt-8">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <SearchIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          <input
            type="text"
            className="block w-full pl-14 pr-4 py-5 bg-card border border-border rounded-2xl text-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm font-serif"
            placeholder="Search Scripture, words, phrases, or topics…"
            autoFocus
          />
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-widest flex items-center gap-2">
            <Tag className="w-4 h-4" /> Suggested Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map(tag => (
              <button 
                key={tag}
                className="px-4 py-2 bg-background border border-border rounded-lg text-sm font-medium text-foreground hover:border-primary hover:text-primary transition-colors shadow-2xs"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
        
        <div className="mt-20 text-center text-muted-foreground">
          <SearchIcon className="w-16 h-16 mx-auto mb-4 opacity-10" />
          <p className="font-serif text-xl text-foreground/50">Type to begin your search</p>
        </div>
      </div>
    </Layout>
  );
}
