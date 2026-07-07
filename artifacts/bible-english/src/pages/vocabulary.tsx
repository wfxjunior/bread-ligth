import React from 'react';
import { Layout } from '../components/layout';
import { MOCK_VOCABULARY } from '../data/mock';
import { BookText, Filter } from 'lucide-react';

export default function VocabularyPage() {
  return (
    <Layout>
      <div className="max-w-5xl mx-auto w-full p-8 md:p-12 overflow-y-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl text-primary mb-2">Vocabulary</h1>
            <p className="text-muted-foreground font-medium">Your saved words and phrases</p>
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </header>

        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-muted-foreground">Word / Phrase</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-muted-foreground">Pronunciation</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-muted-foreground">Meaning</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-muted-foreground">Source</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {MOCK_VOCABULARY.map((item, i) => (
                <tr key={i} className="hover:bg-muted/30 transition-colors">
                  <td className="py-4 px-6">
                    <span className="font-serif text-lg font-medium text-foreground">{item.word}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-muted-foreground font-mono tracking-wide">{item.pronunciation}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-muted-foreground">{item.translation}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-background border border-border text-xs font-medium text-muted-foreground">
                      <BookText className="w-3 h-3" />
                      {item.source}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <StatusBadge status={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    'Mastered': 'bg-secondary/10 text-secondary border-secondary/20',
    'Learning': 'bg-primary/10 text-primary border-primary/20',
    'New': 'bg-muted text-muted-foreground border-border'
  }[status] || 'bg-muted text-muted-foreground border-border';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles}`}>
      {status}
    </span>
  );
}
