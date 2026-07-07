import React, { useState, useRef, useEffect } from 'react';
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
  LayoutDashboard,
  X,
} from 'lucide-react';

type Mode = 'English Only' | 'Bilingual' | 'Study Mode';
type PanelMode = 'verse' | 'word';

// ── Word Dictionary ──────────────────────────────────────────────────────────
interface WordEntry {
  pt: string;
  phonetic: string;
  pos: string;
  note?: string;
}

const WORD_DICT: Record<string, WordEntry> = {
  // Articles & determiners
  the: { pt: 'o / a / os / as', phonetic: '/ðə/', pos: 'artigo' },
  a: { pt: 'um / uma', phonetic: '/ə/', pos: 'artigo' },
  an: { pt: 'um / uma (antes de vogal)', phonetic: '/æn/', pos: 'artigo' },
  // Prepositions & conjunctions
  in: { pt: 'em / dentro de', phonetic: '/ɪn/', pos: 'preposição' },
  of: { pt: 'de / do / da', phonetic: '/ɒv/', pos: 'preposição' },
  with: { pt: 'com', phonetic: '/wɪð/', pos: 'preposição' },
  by: { pt: 'por / através de', phonetic: '/baɪ/', pos: 'preposição' },
  from: { pt: 'de / desde / a partir de', phonetic: '/frɒm/', pos: 'preposição' },
  unto: { pt: 'para / a (forma arcaica de "to")', phonetic: '/ˈʌntʊ/', pos: 'preposição', note: 'Forma antiga de "to" (para). Muito comum em traduções bíblicas.' },
  through: { pt: 'através de / por meio de', phonetic: '/θruː/', pos: 'preposição' },
  upon: { pt: 'sobre / em cima de', phonetic: '/əˈpɒn/', pos: 'preposição' },
  among: { pt: 'entre (vários)', phonetic: '/əˈmʌŋ/', pos: 'preposição' },
  beyond: { pt: 'além de / do outro lado de', phonetic: '/bɪˈɒnd/', pos: 'preposição' },
  before: { pt: 'antes / diante de', phonetic: '/bɪˈfɔːr/', pos: 'preposição/advérbio' },
  after: { pt: 'depois de / após', phonetic: '/ˈɑːftər/', pos: 'preposição' },
  and: { pt: 'e / e também', phonetic: '/ænd/', pos: 'conjunção' },
  but: { pt: 'mas / porém', phonetic: '/bʌt/', pos: 'conjunção' },
  for: { pt: 'pois / porque / para', phonetic: '/fɔːr/', pos: 'conjunção/preposição' },
  nor: { pt: 'nem', phonetic: '/nɔːr/', pos: 'conjunção' },
  not: { pt: 'não', phonetic: '/nɒt/', pos: 'advérbio de negação' },
  // Core theological nouns
  word: { pt: 'Verbo / Palavra', phonetic: '/wɜːrd/', pos: 'substantivo', note: 'No grego original: "Logos" — razão, discurso, sentido. Em João 1, refere-se a Jesus como a Palavra viva de Deus.' },
  god: { pt: 'Deus', phonetic: '/ɡɒd/', pos: 'substantivo' },
  light: { pt: 'luz', phonetic: '/laɪt/', pos: 'substantivo/adjetivo', note: '"Light" pode ser substantivo (a luz) ou adjetivo (leve, claro). Aqui é substantivo.' },
  life: { pt: 'vida', phonetic: '/laɪf/', pos: 'substantivo' },
  darkness: { pt: 'trevas / escuridão', phonetic: '/ˈdɑːrknəs/', pos: 'substantivo' },
  world: { pt: 'mundo', phonetic: '/wɜːrld/', pos: 'substantivo' },
  flesh: { pt: 'carne', phonetic: '/flɛʃ/', pos: 'substantivo', note: 'Além do sentido literal, representa a natureza humana e seus limites morais.' },
  glory: { pt: 'glória', phonetic: '/ˈɡlɔːri/', pos: 'substantivo' },
  grace: { pt: 'graça', phonetic: '/ɡreɪs/', pos: 'substantivo', note: 'Favor imerecido. Em teologia, representa o amor incondicional de Deus.' },
  truth: { pt: 'verdade', phonetic: '/truːθ/', pos: 'substantivo' },
  law: { pt: 'lei', phonetic: '/lɔː/', pos: 'substantivo' },
  witness: { pt: 'testemunha / testemunho', phonetic: '/ˈwɪtnɪs/', pos: 'substantivo/verbo' },
  record: { pt: 'testemunho / registro', phonetic: '/ˈrɛkərd/', pos: 'substantivo' },
  blood: { pt: 'sangue', phonetic: '/blʌd/', pos: 'substantivo' },
  name: { pt: 'nome', phonetic: '/neɪm/', pos: 'substantivo' },
  power: { pt: 'poder / autoridade', phonetic: '/ˈpaʊər/', pos: 'substantivo' },
  sin: { pt: 'pecado', phonetic: '/sɪn/', pos: 'substantivo' },
  spirit: { pt: 'Espírito', phonetic: '/ˈspɪrɪt/', pos: 'substantivo' },
  heaven: { pt: 'céu', phonetic: '/ˈhɛvən/', pos: 'substantivo' },
  angel: { pt: 'anjo', phonetic: '/ˈeɪndʒəl/', pos: 'substantivo' },
  angels: { pt: 'anjos', phonetic: '/ˈeɪndʒəlz/', pos: 'substantivo (plural)' },
  son: { pt: 'Filho', phonetic: '/sʌn/', pos: 'substantivo' },
  father: { pt: 'Pai', phonetic: '/ˈfɑːðər/', pos: 'substantivo' },
  fullness: { pt: 'plenitude / abundância', phonetic: '/ˈfʊlnəs/', pos: 'substantivo' },
  bosom: { pt: 'seio / peito (muito próximo)', phonetic: '/ˈbʊzəm/', pos: 'substantivo', note: 'Imagem de intimidade profunda. "No seio do Pai" significa na relação mais íntima com Deus.' },
  lamb: { pt: 'cordeiro', phonetic: '/læm/', pos: 'substantivo', note: 'Símbolo do sacrifício. "Cordeiro de Deus" remete ao sacrifício de Jesus pelos pecados do mundo.' },
  dove: { pt: 'pomba', phonetic: '/dʌv/', pos: 'substantivo' },
  wilderness: { pt: 'deserto / ermo', phonetic: '/ˈwɪldənəs/', pos: 'substantivo' },
  prophet: { pt: 'profeta', phonetic: '/ˈprɒfɪt/', pos: 'substantivo' },
  priests: { pt: 'sacerdotes', phonetic: '/priːsts/', pos: 'substantivo (plural)' },
  man: { pt: 'homem / ser humano', phonetic: '/mæn/', pos: 'substantivo' },
  men: { pt: 'homens / pessoas', phonetic: '/mɛn/', pos: 'substantivo (plural)' },
  king: { pt: 'rei', phonetic: '/kɪŋ/', pos: 'substantivo' },
  // Verbs
  believe: { pt: 'crer / acreditar', phonetic: '/bɪˈliːv/', pos: 'verbo', note: '"Believe in" = crer em. Diferente de apenas "believe" (achar que algo é verdade) — implica confiança e compromisso.' },
  receive: { pt: 'receber', phonetic: '/rɪˈsiːv/', pos: 'verbo' },
  received: { pt: 'recebeu / receberam', phonetic: '/rɪˈsiːvd/', pos: 'verbo (passado)' },
  know: { pt: 'conhecer / saber', phonetic: '/noʊ/', pos: 'verbo' },
  knew: { pt: 'conhecia / sabia (passado de know)', phonetic: '/njuː/', pos: 'verbo (passado)', note: 'Passado irregular de "know".' },
  see: { pt: 'ver', phonetic: '/siː/', pos: 'verbo' },
  saw: { pt: 'viu / vi (passado de see)', phonetic: '/sɔː/', pos: 'verbo (passado)', note: 'Passado irregular de "see".' },
  dwell: { pt: 'habitar / morar', phonetic: '/dwɛl/', pos: 'verbo' },
  dwelt: { pt: 'habitou / morou (passado de dwell)', phonetic: '/dwɛlt/', pos: 'verbo (passado)', note: 'Forma arcaica do passado de "dwell". Hoje se usa "dwelled" também.' },
  beheld: { pt: 'contemplou / viu (passado de behold)', phonetic: '/bɪˈhɛld/', pos: 'verbo (passado)', note: '"Behold" = contemplar, olhar com atenção. Muito usado na Bíblia.' },
  behold: { pt: 'eis / veja / contemple', phonetic: '/bɪˈhoʊld/', pos: 'verbo/interjeição', note: 'Palavra de atenção: "Olha! Repara! Veja!"' },
  shine: { pt: 'brilhar / resplandecer', phonetic: '/ʃaɪn/', pos: 'verbo' },
  shineth: { pt: 'brilha / resplandece', phonetic: '/ˈʃaɪnɪθ/', pos: 'verbo (arcaico 3ª pessoa)', note: 'Forma arcaica da terceira pessoa do singular: "shineth" = "shines".' },
  cometh: { pt: 'vem (forma arcaica de "comes")', phonetic: '/ˈkʌmɪθ/', pos: 'verbo (arcaico)', note: 'Arcaico para "comes". A terminação "-eth" era usada para 3ª pessoa do singular no inglês antigo.' },
  lighteth: { pt: 'ilumina (forma arcaica de "lights")', phonetic: '/ˈlaɪtɪθ/', pos: 'verbo (arcaico)' },
  baptize: { pt: 'batizar', phonetic: '/ˈbæptaɪz/', pos: 'verbo' },
  baptizeth: { pt: 'batiza (forma arcaica)', phonetic: '/ˈbæptaɪzɪθ/', pos: 'verbo (arcaico)' },
  confessed: { pt: 'confessou / declarou', phonetic: '/kənˈfɛst/', pos: 'verbo (passado)' },
  sent: { pt: 'enviou / enviado (passado de send)', phonetic: '/sɛnt/', pos: 'verbo (passado)', note: 'Passado irregular de "send" (enviar).' },
  made: { pt: 'fez / criou (passado de make)', phonetic: '/meɪd/', pos: 'verbo (passado)' },
  come: { pt: 'vir / chegar', phonetic: '/kʌm/', pos: 'verbo' },
  came: { pt: 'veio (passado de come)', phonetic: '/keɪm/', pos: 'verbo (passado)' },
  give: { pt: 'dar', phonetic: '/ɡɪv/', pos: 'verbo' },
  gave: { pt: 'deu (passado de give)', phonetic: '/ɡeɪv/', pos: 'verbo (passado)' },
  bear: { pt: 'dar testemunho / carregar', phonetic: '/bɛər/', pos: 'verbo', note: 'Verbo com vários significados. "Bear witness" = testemunhar.' },
  bare: { pt: 'deu testemunho (passado arcaico de bear)', phonetic: '/bɛər/', pos: 'verbo (passado arcaico)' },
  seek: { pt: 'buscar / procurar', phonetic: '/siːk/', pos: 'verbo' },
  follow: { pt: 'seguir', phonetic: '/ˈfɒloʊ/', pos: 'verbo' },
  followed: { pt: 'seguiu / seguiram', phonetic: '/ˈfɒloʊd/', pos: 'verbo (passado)' },
  found: { pt: 'encontrou / achou (passado de find)', phonetic: '/faʊnd/', pos: 'verbo (passado)' },
  descending: { pt: 'descendo / descendo', phonetic: '/dɪˈsɛndɪŋ/', pos: 'verbo (gerúndio)' },
  ascending: { pt: 'subindo', phonetic: '/əˈsɛndɪŋ/', pos: 'verbo (gerúndio)' },
  manifest: { pt: 'revelar / manifestar', phonetic: '/ˈmænɪfɛst/', pos: 'verbo/adjetivo' },
  abode: { pt: 'ficou / permaneceu (passado de abide)', phonetic: '/əˈboʊd/', pos: 'verbo (passado)', note: 'Passado arcaico de "abide" (permanecer).' },
  // Adjectives
  true: { pt: 'verdadeiro / verdadeira', phonetic: '/truː/', pos: 'adjetivo' },
  full: { pt: 'cheio / pleno', phonetic: '/fʊl/', pos: 'adjetivo' },
  only: { pt: 'único / somente', phonetic: '/ˈoʊnli/', pos: 'adjetivo/advérbio' },
  begotten: { pt: 'gerado / unigênito', phonetic: '/bɪˈɡɒtən/', pos: 'adjetivo', note: '"Only begotten" = Unigênito. Ênfase na relação única entre Pai e Filho.' },
  holy: { pt: 'santo / sagrado', phonetic: '/ˈhoʊli/', pos: 'adjetivo' },
  greater: { pt: 'maiores / maior', phonetic: '/ˈɡreɪtər/', pos: 'adjetivo (comparativo)' },
  // Pronouns & possessives
  him: { pt: 'ele / o / lhe', phonetic: '/hɪm/', pos: 'pronome' },
  his: { pt: 'seu / dele', phonetic: '/hɪz/', pos: 'pronome possessivo' },
  them: { pt: 'eles / os / lhes', phonetic: '/ðɛm/', pos: 'pronome' },
  their: { pt: 'deles / seu (plural)', phonetic: '/ðɛər/', pos: 'pronome possessivo' },
  whom: { pt: 'quem / o qual (objeto)', phonetic: '/huːm/', pos: 'pronome relativo', note: '"Whom" é o caso objeto de "who". Indica a quem a ação é dirigida.' },
  whose: { pt: 'cujo / de quem', phonetic: '/huːz/', pos: 'pronome relativo' },
  thou: { pt: 'tu / você (forma arcaica)', phonetic: '/ðaʊ/', pos: 'pronome (arcaico)', note: 'Forma arcaica de "you". Ainda usada em textos bíblicos e poéticos.' },
  thee: { pt: 'te / ti (forma arcaica)', phonetic: '/ðiː/', pos: 'pronome (arcaico)', note: 'Forma objeto arcaica de "thou". Como "me" é para "I".' },
  thy: { pt: 'teu / tua (forma arcaica)', phonetic: '/ðaɪ/', pos: 'pronome possessivo (arcaico)' },
  ye: { pt: 'vós / vocês (forma arcaica)', phonetic: '/jiː/', pos: 'pronome (arcaico)', note: 'Forma arcaica plural de "you". Muito comum na Bíblia.' },
  // Other important words
  verily: { pt: 'em verdade / verdadeiramente', phonetic: '/ˈvɛrɪli/', pos: 'advérbio', note: '"Verily, verily" = "Em verdade, em verdade." Forma solene de dar ênfase à verdade de uma declaração.' },
  hereafter: { pt: 'daqui em diante / depois disto', phonetic: '/ˌhɪərˈɑːftər/', pos: 'advérbio' },
  latchet: { pt: 'correia / cadarço (da sandália)', phonetic: '/ˈlætʃɪt/', pos: 'substantivo', note: 'Palavra arcaica para a tira ou cadarço que prende a sandália.' },
  worthy: { pt: 'digno / merecedor', phonetic: '/ˈwɜːrði/', pos: 'adjetivo' },
  guile: { pt: 'dolo / astúcia / engano', phonetic: '/ɡaɪl/', pos: 'substantivo', note: 'Ausência de guile = pessoa sincera, sem falsidade ou má intenção escondida.' },
  unloose: { pt: 'desatar / soltar', phonetic: '/ʌnˈluːs/', pos: 'verbo' },
  comprehended: { pt: 'compreendeu / venceu', phonetic: '/ˌkɒmprɪˈhɛndɪd/', pos: 'verbo (passado)', note: 'Aqui no sentido de "dominar, superar, vencer" — não apenas entender.' },
  declared: { pt: 'declarou / revelou / fez conhecer', phonetic: '/dɪˈklɛrd/', pos: 'verbo (passado)' },
  preferred: { pt: 'preferido / mais honrado', phonetic: '/prɪˈfɜːrd/', pos: 'adjetivo/verbo (passado)' },
  straight: { pt: 'reto / direto', phonetic: '/streɪt/', pos: 'adjetivo/advérbio' },
};

// ── Token helper ──────────────────────────────────────────────────────────────
function tokenize(text: string) {
  const parts: { pre: string; word: string; post: string }[] = [];
  text.split(' ').forEach(token => {
    const m = token.match(/^([^a-zA-Z]*)([a-zA-Z''-]+)([^a-zA-Z]*)$/);
    if (m) parts.push({ pre: m[1], word: m[2], post: m[3] });
    else parts.push({ pre: token, word: '', post: '' });
  });
  return parts;
}

// ── Clickable verse text component ───────────────────────────────────────────
function ClickableVerseText({
  text,
  selectedWord,
  onWordClick,
}: {
  text: string;
  selectedWord: string | null;
  onWordClick: (w: string) => void;
}) {
  const tokens = tokenize(text);
  return (
    <span>
      {tokens.map((t, i) => {
        const clean = t.word.replace(/['']/g, "'").toLowerCase().replace(/'/g, '');
        const lookup = t.word.toLowerCase().replace(/['']/g, "'");
        const hasEntry = lookup in WORD_DICT || clean in WORD_DICT;
        const isSelected = selectedWord !== null && (lookup === selectedWord || clean === selectedWord);
        return (
          <span key={i}>
            {t.pre}
            {t.word ? (
              <span
                onClick={e => {
                  e.stopPropagation();
                  if (hasEntry) onWordClick(lookup in WORD_DICT ? lookup : clean);
                }}
                className={`transition-colors ${
                  hasEntry
                    ? 'cursor-pointer underline decoration-dotted underline-offset-2 decoration-primary/40 hover:text-primary hover:decoration-primary'
                    : ''
                } ${isSelected ? 'text-primary bg-primary/10 rounded-sm px-0.5' : ''}`}
              >
                {t.word}
              </span>
            ) : null}
            {t.post}{i < tokens.length - 1 ? ' ' : ''}
          </span>
        );
      })}
    </span>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
type Mode2 = 'English Only' | 'Bilingual' | 'Study Mode';

export default function ReaderPage() {
  const [mode, setMode] = useState<Mode2>('Bilingual');
  const [selectedVerseId, setSelectedVerseId] = useState<number>(1);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [panelMode, setPanelMode] = useState<PanelMode>('verse');
  const [isCompleted, setIsCompleted] = useState(false);
  const [bookmarkedVerses, setBookmarkedVerses] = useState<Set<number>>(new Set());
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set(['word', 'light', 'grace']));

  const selectedVerse = MOCK_VERSES.find(v => v.id === selectedVerseId);
  const wordEntry = selectedWord ? (WORD_DICT[selectedWord] ?? null) : null;

  const handleVerseClick = (id: number) => {
    setSelectedVerseId(id);
    setSelectedWord(null);
    setPanelMode('verse');
  };

  const handleWordClick = (word: string) => {
    setSelectedWord(word);
    setPanelMode('word');
  };

  const toggleBookmark = (id: number) => {
    setBookmarkedVerses(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSaveWord = (w: string) => {
    setSavedWords(prev => {
      const next = new Set(prev);
      if (next.has(w)) next.delete(w); else next.add(w);
      return next;
    });
  };

  return (
    <Layout>
      <div className="flex h-full w-full">
        {/* ── Center Panel ── */}
        <div className="flex-1 flex flex-col h-full border-r border-border relative">

          {/* Header */}
          <header className="h-16 px-6 border-b border-border flex items-center justify-between shrink-0 bg-background/95 backdrop-blur z-10">
            <div className="flex items-center gap-4">
              <button aria-label="Search" className="text-muted-foreground hover:text-foreground transition-colors">
                <Search className="w-4 h-4" />
              </button>
              <div className="h-4 w-[1px] bg-border" />
              <button aria-label="Notes" className="text-muted-foreground hover:text-foreground transition-colors">
                <Feather className="w-4 h-4" />
              </button>
              <button aria-label="Bookmark" className="text-muted-foreground hover:text-foreground transition-colors">
                <Bookmark className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center p-1 bg-muted rounded-md border border-border/50">
              {(['English Only', 'Bilingual', 'Study Mode'] as Mode2[]).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1 text-xs font-medium rounded-sm transition-all ${
                    mode === m ? 'bg-background text-primary shadow-xs' : 'text-muted-foreground hover:text-foreground'
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

          {/* Hint bar */}
          {(mode === 'English Only' || mode === 'Bilingual' || mode === 'Study Mode') && (
            <div className="px-6 py-2 bg-secondary/5 border-b border-border/50 flex items-center gap-2">
              <span className="text-xs text-secondary font-medium">Tap any underlined word to see its translation</span>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto scroll-smooth">
            <div className="max-w-2xl mx-auto px-12 py-12">
              <h2 className="font-serif text-4xl text-center mb-12 text-primary tracking-wide">
                The Gospel According to John
              </h2>
              <p className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground mb-10">
                Chapter 1 · 51 verses
              </p>

              <div className="space-y-6">
                {MOCK_VERSES.map(verse => {
                  const isSelected = verse.id === selectedVerseId;
                  return (
                    <div
                      key={verse.id}
                      className={`relative flex gap-4 p-4 -mx-4 rounded-xl transition-colors cursor-pointer border border-transparent ${
                        isSelected ? 'bg-primary/5 border-primary/10' : 'hover:bg-muted/40'
                      }`}
                      onClick={() => handleVerseClick(verse.id)}
                    >
                      <div className="text-xs font-medium text-muted-foreground pt-1.5 w-6 shrink-0 text-right select-none">
                        {verse.verseNumber}
                      </div>
                      <div className="flex-1 space-y-2.5">
                        {/* English */}
                        {(mode !== 'English Only' || true) && mode !== 'English Only' ? null : null}
                        {(mode === 'English Only' || mode === 'Bilingual' || mode === 'Study Mode') && (
                          <div className={`font-serif text-[1.25rem] leading-relaxed ${isSelected ? 'text-primary/90' : 'text-foreground'}`}>
                            <ClickableVerseText
                              text={verse.english}
                              selectedWord={isSelected ? selectedWord : null}
                              onWordClick={handleWordClick}
                            />
                          </div>
                        )}
                        {/* Portuguese */}
                        {(mode === 'Bilingual' || mode === 'Study Mode') && (
                          <div className="font-sans text-[0.9rem] leading-relaxed text-muted-foreground">
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

          {/* Footer */}
          <footer className="h-20 border-t border-border bg-background px-6 flex items-center justify-between shrink-0">
            <button aria-label="Previous Chapter" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-muted">
              <ChevronLeft className="w-4 h-4" /> Previous Chapter
            </button>
            <div className="flex items-center gap-6">
              <button aria-label="Play audio" className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-xs border border-primary/20">
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
            <button aria-label="Next Chapter" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-muted">
              Next Chapter <ChevronRight className="w-4 h-4" />
            </button>
          </footer>
        </div>

        {/* ── Right Panel ── */}
        <div className="w-96 bg-card flex flex-col h-full shrink-0">

          {/* Word Panel */}
          {panelMode === 'word' && wordEntry && selectedWord ? (
            <>
              <div className="h-16 px-6 border-b border-border flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <span className="font-serif text-2xl text-primary capitalize">{selectedWord}</span>
                  <span className="text-xs text-muted-foreground font-mono">{wordEntry.phonetic}</span>
                </div>
                <button
                  aria-label="Close word panel"
                  onClick={() => { setSelectedWord(null); setPanelMode('verse'); }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Word card */}
                <div className="bg-background border border-border rounded-xl p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-serif text-3xl text-foreground capitalize">{selectedWord}</p>
                      <p className="text-xs font-mono text-muted-foreground mt-0.5">{wordEntry.phonetic}</p>
                    </div>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 capitalize shrink-0 mt-1">
                      {wordEntry.pos}
                    </span>
                  </div>
                  <div className="h-[1px] bg-border" />
                  <div>
                    <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-1">Português</p>
                    <p className="text-lg text-foreground font-medium">{wordEntry.pt}</p>
                  </div>
                </div>

                {/* Grammar note */}
                {wordEntry.note && (
                  <div className="space-y-2">
                    <h4 className="text-xs uppercase tracking-widest font-semibold text-muted-foreground flex items-center gap-2">
                      <LayoutDashboard className="w-3 h-3" /> Nota Gramatical
                    </h4>
                    <p className="text-sm leading-relaxed text-foreground bg-background border border-border/60 rounded-lg p-4">
                      {wordEntry.note}
                    </p>
                  </div>
                )}

                {/* In this verse */}
                {selectedVerse && (
                  <div className="space-y-2">
                    <h4 className="text-xs uppercase tracking-widest font-semibold text-muted-foreground flex items-center gap-2">
                      <BookOpen className="w-3 h-3" /> No versículo
                    </h4>
                    <div className="bg-background border border-border/60 rounded-lg p-4 space-y-2">
                      <p className="font-serif text-sm leading-relaxed text-foreground">{selectedVerse.english}</p>
                      <div className="h-[1px] bg-border/50" />
                      <p className="text-xs text-muted-foreground leading-relaxed">{selectedVerse.portuguese}</p>
                    </div>
                  </div>
                )}

                {/* Save button */}
                <button
                  onClick={() => toggleSaveWord(selectedWord)}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all ${
                    savedWords.has(selectedWord)
                      ? 'bg-secondary/10 border-secondary/30 text-secondary'
                      : 'bg-background border-border text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  {savedWords.has(selectedWord) ? 'Saved to Vocabulary' : 'Save to Vocabulary'}
                </button>
              </div>
            </>
          ) : (
            /* Verse Panel */
            selectedVerse ? (
              <>
                <div className="h-16 px-6 border-b border-border flex items-center justify-between shrink-0">
                  <h3 className="font-serif text-xl text-primary">John 1:{selectedVerse.verseNumber}</h3>
                  <button
                    aria-label="Bookmark verse"
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
                  <div className="space-y-4 bg-background p-4 rounded-xl border border-border/60 shadow-2xs">
                    <p className="font-serif text-lg leading-snug text-foreground">{selectedVerse.english}</p>
                    <div className="w-8 h-[1px] bg-border" />
                    <p className="font-sans text-sm text-muted-foreground">{selectedVerse.portuguese}</p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs uppercase tracking-widest font-semibold text-muted-foreground flex items-center gap-2">
                      <BookOpen className="w-3 h-3" /> Contexto
                    </h4>
                    <p className="text-sm leading-relaxed text-foreground">
                      João começa seu evangelho não com o nascimento de Jesus, mas com a eternidade. Ele identifica Jesus como o "Verbo" (Logos), mostrando que Ele sempre existiu junto a Deus.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs uppercase tracking-widest font-semibold text-muted-foreground flex items-center gap-2">
                      <BookText className="w-3 h-3" /> Vocabulary
                      <span className="text-[10px] text-muted-foreground font-normal ml-auto">Tap words above to explore</span>
                    </h4>
                    <div className="space-y-2">
                      {[
                        { eng: 'word', pt: 'Verbo / Palavra' },
                        { eng: 'beginning', pt: 'Princípio / Começo' },
                        { eng: 'god', pt: 'Deus' },
                      ].map(v => (
                        <div key={v.eng} className="flex items-center justify-between p-3 rounded-lg border bg-background border-border/60 hover:border-border transition-all">
                          <div>
                            <p className="font-medium text-sm text-foreground capitalize">{v.eng}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{v.pt}</p>
                          </div>
                          <button
                            aria-label={`Save ${v.eng}`}
                            onClick={() => toggleSaveWord(v.eng)}
                            className={`p-1.5 rounded-md hover:bg-muted transition-colors ${savedWords.has(v.eng) ? 'text-secondary' : 'text-muted-foreground'}`}
                          >
                            <Save className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs uppercase tracking-widest font-semibold text-muted-foreground flex items-center gap-2">
                      <LayoutDashboard className="w-3 h-3" /> Grammar Notes
                    </h4>
                    <ul className="space-y-3 text-sm">
                      <li className="flex gap-2">
                        <span className="text-primary font-medium shrink-0">was</span>
                        <span className="text-foreground">Passado do verbo "to be". Indica existência contínua no passado.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary font-medium shrink-0">the Word</span>
                        <span className="text-foreground">Artigo "the" especifica que não é uma palavra qualquer, mas O Verbo único.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs uppercase tracking-widest font-semibold text-muted-foreground flex items-center gap-2">
                        <Feather className="w-3 h-3" /> My Note
                      </h4>
                      <span className="text-[10px] text-muted-foreground">Today</span>
                    </div>
                    <div className="bg-background border border-border/60 rounded-xl p-4 text-sm text-foreground italic font-serif">
                      "This connects back to Genesis 1:1. The parallelism is incredibly beautiful."
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <BookOpen className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-serif text-lg text-foreground">Select a verse</p>
                <p className="text-sm mt-2">Click on any verse to view study notes. Tap any underlined word for its translation.</p>
              </div>
            )
          )}
        </div>
      </div>
    </Layout>
  );
}
