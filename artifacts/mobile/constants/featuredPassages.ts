// ── Featured Passages — curated highlights shown in the Home carousel ─────────
// Each passage points at a real, transcribed book/chapter so tapping a card
// opens an actual reading experience (not a stub). Badge/label copy is
// resolved through i18n at render time; only the raw content lives here.
export interface FeaturedPassage {
  id: string;
  bookId: string;
  chapter: number;
  bookName: string;
  englishBookName: string;
  refLabel: string;
  badgeKey:
    | 'featured_badge_hope'
    | 'featured_badge_faith'
    | 'featured_badge_love'
    | 'featured_badge_wisdom'
    | 'featured_badge_grace';
  snippetEn: string;
  snippetPt: string;
  accentIndex: number; // 0-4, cycles through secondaryAccent-adjacent tones
}

export const FEATURED_PASSAGES: FeaturedPassage[] = [
  {
    id: 'john-1',
    bookId: 'john',
    chapter: 1,
    bookName: 'João',
    englishBookName: 'John',
    refLabel: 'John 1',
    badgeKey: 'featured_badge_faith',
    snippetEn: 'In the beginning was the Word, and the Word was with God, and the Word was God.',
    snippetPt: 'No princípio era o Verbo, e o Verbo estava com Deus, e o Verbo era Deus.',
    accentIndex: 0,
  },
  {
    id: 'psalms-23',
    bookId: 'psalms',
    chapter: 23,
    bookName: 'Salmos',
    englishBookName: 'Psalms',
    refLabel: 'Psalms 23',
    badgeKey: 'featured_badge_hope',
    snippetEn: 'The Lord is my shepherd; I shall not want.',
    snippetPt: 'O Senhor é o meu pastor; nada me faltará.',
    accentIndex: 1,
  },
  {
    id: 'romans-8',
    bookId: 'romans',
    chapter: 8,
    bookName: 'Romanos',
    englishBookName: 'Romans',
    refLabel: 'Romans 8',
    badgeKey: 'featured_badge_grace',
    snippetEn: 'And we know that in all things God works for the good of those who love him.',
    snippetPt: 'E sabemos que todas as coisas cooperam para o bem daqueles que amam a Deus.',
    accentIndex: 2,
  },
  {
    id: '1corinthians-13',
    bookId: '1corinthians',
    chapter: 13,
    bookName: '1 Coríntios',
    englishBookName: '1 Corinthians',
    refLabel: '1 Corinthians 13',
    badgeKey: 'featured_badge_love',
    snippetEn: 'Love is patient, love is kind. It does not envy, it does not boast, it is not proud.',
    snippetPt: 'O amor é paciente, o amor é bondoso. Não tem invejas, não se ufana, não se ensoberbece.',
    accentIndex: 3,
  },
  {
    id: 'proverbs-3',
    bookId: 'proverbs',
    chapter: 3,
    bookName: 'Provérbios',
    englishBookName: 'Proverbs',
    refLabel: 'Proverbs 3',
    badgeKey: 'featured_badge_wisdom',
    snippetEn: 'Trust in the Lord with all your heart and lean not on your own understanding.',
    snippetPt: 'Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento.',
    accentIndex: 4,
  },
  {
    id: 'philippians-4',
    bookId: 'philippians',
    chapter: 4,
    bookName: 'Filipenses',
    englishBookName: 'Philippians',
    refLabel: 'Philippians 4',
    badgeKey: 'featured_badge_hope',
    snippetEn: 'I can do all this through him who gives me strength.',
    snippetPt: 'Tudo posso naquele que me fortalece.',
    accentIndex: 0,
  },
];
