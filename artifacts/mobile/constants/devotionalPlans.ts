// ── Curated devotional plans — built-in starter collections ────────────────────
// These are fixed (not user-editable/deletable) and ship with real verses
// pulled from the transcribed books, so the Devotional Plans screen always has
// content even before a user creates their own plan. A user's own added
// verses (BibleContext.planVerses) layer on top of these by planId.
export interface CuratedPlanVerse {
  bookId: string;
  chapter: number;
  verse: number;
  bookName: string;
  englishBookName: string;
  en: string;
  pt: string;
}

export interface CuratedPlan {
  id: string;
  titleKey: 'plan_morning_title' | 'plan_promises_title' | 'plan_john_title';
  descKey: 'plan_morning_desc' | 'plan_promises_desc' | 'plan_john_desc';
  scheduleKey: 'plan_schedule_daily' | 'plan_schedule_weekly';
  verses: CuratedPlanVerse[];
}

export const CURATED_PLANS: CuratedPlan[] = [
  {
    id: 'curated-morning',
    titleKey: 'plan_morning_title',
    descKey: 'plan_morning_desc',
    scheduleKey: 'plan_schedule_daily',
    verses: [
      { bookId: 'psalms', chapter: 23, verse: 1, bookName: 'Salmos', englishBookName: 'Psalms', en: 'The Lord is my shepherd; I shall not want.', pt: 'O Senhor é o meu pastor; nada me faltará.' },
      { bookId: 'philippians', chapter: 4, verse: 13, bookName: 'Filipenses', englishBookName: 'Philippians', en: 'I can do all this through him who gives me strength.', pt: 'Tudo posso naquele que me fortalece.' },
      { bookId: 'proverbs', chapter: 3, verse: 5, bookName: 'Provérbios', englishBookName: 'Proverbs', en: 'Trust in the Lord with all your heart and lean not on your own understanding.', pt: 'Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento.' },
    ],
  },
  {
    id: 'curated-promises',
    titleKey: 'plan_promises_title',
    descKey: 'plan_promises_desc',
    scheduleKey: 'plan_schedule_weekly',
    verses: [
      { bookId: 'romans', chapter: 8, verse: 28, bookName: 'Romanos', englishBookName: 'Romans', en: 'And we know that in all things God works for the good of those who love him.', pt: 'E sabemos que todas as coisas cooperam para o bem daqueles que amam a Deus.' },
      { bookId: '1corinthians', chapter: 13, verse: 4, bookName: '1 Coríntios', englishBookName: '1 Corinthians', en: 'Love is patient, love is kind.', pt: 'O amor é paciente, o amor é bondoso.' },
      { bookId: 'matthew', chapter: 6, verse: 33, bookName: 'Mateus', englishBookName: 'Matthew', en: 'But seek first his kingdom and his righteousness, and all these things will be given to you as well.', pt: 'Mas buscai primeiro o Reino de Deus, e a sua justiça, e todas estas coisas vos serão acrescentadas.' },
    ],
  },
  {
    id: 'curated-john',
    titleKey: 'plan_john_title',
    descKey: 'plan_john_desc',
    scheduleKey: 'plan_schedule_daily',
    verses: [
      { bookId: 'john', chapter: 1, verse: 1, bookName: 'João', englishBookName: 'John', en: 'In the beginning was the Word, and the Word was with God, and the Word was God.', pt: 'No princípio era o Verbo, e o Verbo estava com Deus, e o Verbo era Deus.' },
      { bookId: 'john', chapter: 3, verse: 16, bookName: 'João', englishBookName: 'John', en: 'For God so loved the world that he gave his one and only Son.', pt: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito.' },
    ],
  },
];
