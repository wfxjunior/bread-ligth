import React, { useState } from 'react';
import { MOCK_VERSES } from '../data/mock';
import { Layout } from '../components/layout';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Search, 
  Feather, 
  Bookmark,
  CheckCircle2,
  Circle,
  Save,
  BookOpen,
  BookText,
  LayoutDashboard
} from 'lucide-react';

type Mode = 'English Only' | 'Bilingual' | 'Study Mode';

export default function ReaderPage() {
  const [mode, setMode] = useState<Mode>('Bilingual');
  const [selectedVerseId, setSelectedVerseId] = useState<number>(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [bookmarkedVerses, setBookmarkedVerses] = useState<Set<number>>(new Set());

  const toggleBookmark = (id: number) => {
    setBookmarkedVerses(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedVerse = MOCK_VERSES.find(v => v.id === selectedVerseId);

  return (
    <Layout>
      <div className="flex h-full w-full">
        {/* Center Panel: Bible Reader */}
        <div className="flex-1 flex flex-col h-full border-r border-border relative">
          
          {/* Reader Header */}
          <header className="h-16 px-6 border-b border-border flex items-center justify-between shrink-0 bg-background/95 backdrop-blur z-10">
            <div className="flex items-center gap-4">
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <Search className="w-4 h-4" />
              </button>
              <div className="h-4 w-[1px] bg-border" />
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <Feather className="w-4 h-4" />
              </button>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <Bookmark className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center p-1 bg-muted rounded-md border border-border/50">
              {(['English Only', 'Bilingual', 'Study Mode'] as Mode[]).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1 text-xs font-medium rounded-sm transition-all ${
                    mode === m 
                      ? 'bg-background text-primary shadow-xs' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <div className="font-serif font-medium text-lg text-foreground px-4 py-1 rounded-md bg-accent/30 border border-border/50">
              John 1
            </div>
          </header>

          {/* Reader Content */}
          <div className="flex-1 overflow-y-auto scroll-smooth">
            <div className="max-w-2xl mx-auto px-12 py-16">
              
              <h2 className="font-serif text-4xl text-center mb-16 text-primary tracking-wide">The Gospel According to John</h2>

              <div className="space-y-8">
                {MOCK_VERSES.map(verse => {
                  const isSelected = verse.id === selectedVerseId;
                  
                  return (
                    <div 
                      key={verse.id} 
                      className={`relative flex gap-4 p-4 -mx-4 rounded-xl transition-colors cursor-pointer border border-transparent ${
                        isSelected ? 'bg-primary/5 border-primary/10' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedVerseId(verse.id)}
                    >
                      <div className="text-xs font-medium text-muted-foreground pt-1.5 w-6 shrink-0 text-right">
                        {verse.verseNumber}
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        {/* English Text */}
                        {(mode === 'Bilingual' || mode === 'English Only' || mode === 'Study Mode') && (
                          <div className={`font-serif text-[1.3rem] leading-relaxed text-foreground ${isSelected ? 'text-primary' : ''}`}>
                            {verse.id === 1 ? (
                              <span>
                                In the beginning was the <span className="bg-secondary/30 px-1 py-0.5 rounded cursor-pointer hover:bg-secondary/50 transition-colors">Word</span>, and the Word was with God, and the Word was God.
                              </span>
                            ) : (
                              verse.english
                            )}
                          </div>
                        )}
                        
                        {/* Portuguese Text */}
                        {(mode === 'Bilingual' || mode === 'Study Mode') && (
                          <div className="font-sans text-[0.95rem] leading-relaxed text-muted-foreground">
                            {verse.portuguese}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Reader Footer */}
          <footer className="h-20 border-t border-border bg-background px-6 flex items-center justify-between shrink-0">
            <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-muted">
              <ChevronLeft className="w-4 h-4" />
              Previous Chapter
            </button>
            
            <div className="flex items-center gap-6">
              <button className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-xs border border-primary/20">
                <Play className="w-5 h-5 ml-1" />
              </button>
              
              <button 
                onClick={() => setIsCompleted(!isCompleted)}
                className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md border transition-all ${
                  isCompleted 
                    ? 'bg-secondary/20 border-secondary/40 text-secondary-foreground' 
                    : 'bg-background border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                {isCompleted ? <CheckCircle2 className="w-4 h-4 text-secondary" /> : <Circle className="w-4 h-4" />}
                {isCompleted ? 'Completed' : 'Mark as Completed'}
              </button>
            </div>

            <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-muted">
              Next Chapter
              <ChevronRight className="w-4 h-4" />
            </button>
          </footer>
        </div>

        {/* Right Panel: Study Panel */}
        <div className="w-96 bg-card flex flex-col h-full shrink-0">
          {selectedVerse ? (
            <>
              <div className="h-16 px-6 border-b border-border flex items-center justify-between shrink-0">
                <h3 className="font-serif text-xl text-primary">John 1:{selectedVerse.verseNumber}</h3>
                <button 
                  onClick={() => toggleBookmark(selectedVerse.id)}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Bookmark className={`w-5 h-5 ${bookmarkedVerses.has(selectedVerse.id) ? 'fill-primary text-primary' : ''}`} />
                </button>
              </div>
              
              <div className="flex border-b border-border">
                {['Study', 'Note', 'Cross Ref.', 'Audio'].map((tab, i) => (
                  <button 
                    key={tab}
                    className={`flex-1 py-3 text-xs font-medium border-b-2 transition-colors ${
                      i === 0 
                        ? 'border-primary text-primary bg-primary/5' 
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth">
                {/* Text Reference */}
                <div className="space-y-4 bg-background p-4 rounded-xl border border-border/60 shadow-2xs">
                  <p className="font-serif text-lg leading-snug text-foreground">
                    {selectedVerse.english}
                  </p>
                  <div className="w-8 h-[1px] bg-border" />
                  <p className="font-sans text-sm text-muted-foreground">
                    {selectedVerse.portuguese}
                  </p>
                </div>

                {/* Context Section */}
                <div className="space-y-3">
                  <h4 className="text-xs uppercase tracking-widest font-semibold text-muted-foreground flex items-center gap-2">
                    <BookOpen className="w-3 h-3" /> Contexto
                  </h4>
                  <p className="text-sm leading-relaxed text-foreground">
                    João começa seu evangelho não com o nascimento de Jesus, mas com a eternidade. Ele identifica Jesus como o "Verbo" (Logos), mostrando que Ele sempre existiu junto a Deus.
                  </p>
                </div>

                {/* Vocabulary */}
                <div className="space-y-3">
                  <h4 className="text-xs uppercase tracking-widest font-semibold text-muted-foreground flex items-center gap-2">
                    <BookText className="w-3 h-3" /> Vocabulary
                  </h4>
                  
                  <div className="space-y-2">
                    {[
                      { eng: 'Word', pt: 'Verbo / Palavra', active: true },
                      { eng: 'Beginning', pt: 'Princípio / Começo', active: false },
                      { eng: 'God', pt: 'Deus', active: false }
                    ].map(v => (
                      <div key={v.eng} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                        v.active ? 'bg-secondary/10 border-secondary/30' : 'bg-background border-border/60 hover:border-border'
                      }`}>
                        <div>
                          <p className={`font-medium text-sm ${v.active ? 'text-primary' : 'text-foreground'}`}>{v.eng}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{v.pt}</p>
                        </div>
                        <button className={`p-1.5 rounded-md hover:bg-muted transition-colors ${v.active ? 'text-secondary-foreground' : 'text-muted-foreground'}`}>
                          <Save className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Grammar Notes */}
                <div className="space-y-3">
                  <h4 className="text-xs uppercase tracking-widest font-semibold text-muted-foreground flex items-center gap-2">
                    <LayoutDashboard className="w-3 h-3" /> Grammar Notes
                  </h4>
                  <ul className="space-y-3 text-sm">
                    <li className="flex gap-2">
                      <span className="text-primary font-medium shrink-0">was</span>
                      <span className="text-foreground">Passado do verbo to be (ser/estar). Indica uma existência contínua no passado.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-medium shrink-0">the Word</span>
                      <span className="text-foreground">Uso do artigo definido 'the' especifica que não é uma palavra qualquer, mas O Verbo único.</span>
                    </li>
                  </ul>
                </div>

                {/* My Note */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs uppercase tracking-widest font-semibold text-muted-foreground flex items-center gap-2">
                      <Feather className="w-3 h-3" /> My Note
                    </h4>
                    <span className="text-[10px] text-muted-foreground">Today</span>
                  </div>
                  <div className="bg-background border border-border/60 rounded-xl p-4 text-sm text-foreground italic font-serif">
                    "This connects back to Genesis 1:1. The parallelism is incredibly beautiful. A word reveals the mind, Jesus reveals God."
                  </div>
                </div>

              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <BookOpen className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-serif text-lg text-foreground">Select a verse</p>
              <p className="text-sm mt-2">Click on any verse in the reader to view detailed study notes, vocabulary, and grammar context.</p>
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
}
