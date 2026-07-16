export interface BibleVerse {
  v: number;
  en: string;
  pt: string;
}

export interface BibleBook {
  id: string;
  name: string;
  englishName: string;
  testament: 'old' | 'new';
  chapters: Record<number, BibleVerse[]>;
}

// ── Full Bible, 66 books ──────────────────────────────────────────────────
// Text auto-generated from public-domain sources: World English Bible (WEB, EN)
// + João Ferreira de Almeida (Almeida, PT). See docs for provenance.
import bk_genesis from './bible/genesis';
import bk_exodus from './bible/exodus';
import bk_leviticus from './bible/leviticus';
import bk_numbers from './bible/numbers';
import bk_deuteronomy from './bible/deuteronomy';
import bk_joshua from './bible/joshua';
import bk_judges from './bible/judges';
import bk_ruth from './bible/ruth';
import bk_1samuel from './bible/1samuel';
import bk_2samuel from './bible/2samuel';
import bk_1kings from './bible/1kings';
import bk_2kings from './bible/2kings';
import bk_1chronicles from './bible/1chronicles';
import bk_2chronicles from './bible/2chronicles';
import bk_ezra from './bible/ezra';
import bk_nehemiah from './bible/nehemiah';
import bk_esther from './bible/esther';
import bk_job from './bible/job';
import bk_psalms from './bible/psalms';
import bk_proverbs from './bible/proverbs';
import bk_ecclesiastes from './bible/ecclesiastes';
import bk_songofsolomon from './bible/songofsolomon';
import bk_isaiah from './bible/isaiah';
import bk_jeremiah from './bible/jeremiah';
import bk_lamentations from './bible/lamentations';
import bk_ezekiel from './bible/ezekiel';
import bk_daniel from './bible/daniel';
import bk_hosea from './bible/hosea';
import bk_joel from './bible/joel';
import bk_amos from './bible/amos';
import bk_obadiah from './bible/obadiah';
import bk_jonah from './bible/jonah';
import bk_micah from './bible/micah';
import bk_nahum from './bible/nahum';
import bk_habakkuk from './bible/habakkuk';
import bk_zephaniah from './bible/zephaniah';
import bk_haggai from './bible/haggai';
import bk_zechariah from './bible/zechariah';
import bk_malachi from './bible/malachi';
import bk_matthew from './bible/matthew';
import bk_mark from './bible/mark';
import bk_luke from './bible/luke';
import bk_john from './bible/john';
import bk_acts from './bible/acts';
import bk_romans from './bible/romans';
import bk_1corinthians from './bible/1corinthians';
import bk_2corinthians from './bible/2corinthians';
import bk_galatians from './bible/galatians';
import bk_ephesians from './bible/ephesians';
import bk_philippians from './bible/philippians';
import bk_colossians from './bible/colossians';
import bk_1thessalonians from './bible/1thessalonians';
import bk_2thessalonians from './bible/2thessalonians';
import bk_1timothy from './bible/1timothy';
import bk_2timothy from './bible/2timothy';
import bk_titus from './bible/titus';
import bk_philemon from './bible/philemon';
import bk_hebrews from './bible/hebrews';
import bk_james from './bible/james';
import bk_1peter from './bible/1peter';
import bk_2peter from './bible/2peter';
import bk_1john from './bible/1john';
import bk_2john from './bible/2john';
import bk_3john from './bible/3john';
import bk_jude from './bible/jude';
import bk_revelation from './bible/revelation';

export const BIBLE_DATA: Record<string, BibleBook> = {
  'genesis': bk_genesis,
  'exodus': bk_exodus,
  'leviticus': bk_leviticus,
  'numbers': bk_numbers,
  'deuteronomy': bk_deuteronomy,
  'joshua': bk_joshua,
  'judges': bk_judges,
  'ruth': bk_ruth,
  '1samuel': bk_1samuel,
  '2samuel': bk_2samuel,
  '1kings': bk_1kings,
  '2kings': bk_2kings,
  '1chronicles': bk_1chronicles,
  '2chronicles': bk_2chronicles,
  'ezra': bk_ezra,
  'nehemiah': bk_nehemiah,
  'esther': bk_esther,
  'job': bk_job,
  'psalms': bk_psalms,
  'proverbs': bk_proverbs,
  'ecclesiastes': bk_ecclesiastes,
  'songofsolomon': bk_songofsolomon,
  'isaiah': bk_isaiah,
  'jeremiah': bk_jeremiah,
  'lamentations': bk_lamentations,
  'ezekiel': bk_ezekiel,
  'daniel': bk_daniel,
  'hosea': bk_hosea,
  'joel': bk_joel,
  'amos': bk_amos,
  'obadiah': bk_obadiah,
  'jonah': bk_jonah,
  'micah': bk_micah,
  'nahum': bk_nahum,
  'habakkuk': bk_habakkuk,
  'zephaniah': bk_zephaniah,
  'haggai': bk_haggai,
  'zechariah': bk_zechariah,
  'malachi': bk_malachi,
  'matthew': bk_matthew,
  'mark': bk_mark,
  'luke': bk_luke,
  'john': bk_john,
  'acts': bk_acts,
  'romans': bk_romans,
  '1corinthians': bk_1corinthians,
  '2corinthians': bk_2corinthians,
  'galatians': bk_galatians,
  'ephesians': bk_ephesians,
  'philippians': bk_philippians,
  'colossians': bk_colossians,
  '1thessalonians': bk_1thessalonians,
  '2thessalonians': bk_2thessalonians,
  '1timothy': bk_1timothy,
  '2timothy': bk_2timothy,
  'titus': bk_titus,
  'philemon': bk_philemon,
  'hebrews': bk_hebrews,
  'james': bk_james,
  '1peter': bk_1peter,
  '2peter': bk_2peter,
  '1john': bk_1john,
  '2john': bk_2john,
  '3john': bk_3john,
  'jude': bk_jude,
  'revelation': bk_revelation,
};

export interface FeaturedPassage {
  bookId: string;
  chapter: number;
  titlePt: string;
  titleEn: string;
  gradient: [string, string];
}

export const FEATURED_PASSAGES: FeaturedPassage[] = [
  { bookId: 'genesis',      chapter: 1,  titlePt: 'A Criação',           titleEn: 'The Creation',          gradient: ['#1B3A6B', '#2A5298'] },
  { bookId: 'genesis',      chapter: 22, titlePt: 'O Sacrifício de Isaque', titleEn: 'The Sacrifice of Isaac', gradient: ['#4A2A1B', '#8E5A2E'] },
  { bookId: 'psalms',       chapter: 23, titlePt: 'O Bom Pastor',        titleEn: 'The Good Shepherd',     gradient: ['#3D6B41', '#5A9E60'] },
  { bookId: 'psalms',       chapter: 91, titlePt: 'Refúgio no Altíssimo', titleEn: 'Refuge in the Most High', gradient: ['#1B4A4A', '#2E8E8E'] },
  { bookId: 'psalms',       chapter: 121, titlePt: 'Meu Socorro',        titleEn: 'My Help',               gradient: ['#2A3A6B', '#3F5AA0'] },
  { bookId: 'proverbs',     chapter: 3,  titlePt: 'Confia no Senhor',    titleEn: 'Trust in the LORD',     gradient: ['#4A3A1B', '#8E6E2E'] },
  { bookId: 'proverbs',     chapter: 8,  titlePt: 'A Sabedoria Clama',   titleEn: 'Wisdom Cries Out',      gradient: ['#3A1B4A', '#7B3FAA'] },
  { bookId: 'proverbs',     chapter: 31, titlePt: 'A Mulher Virtuosa',   titleEn: 'The Virtuous Woman',    gradient: ['#6B1B4A', '#AA3F7B'] },
  { bookId: 'matthew',      chapter: 5,  titlePt: 'Bem-aventuranças',    titleEn: 'The Beatitudes',        gradient: ['#4A1B6B', '#7B3FAA'] },
  { bookId: 'matthew',      chapter: 6,  titlePt: 'O Pai Nosso',         titleEn: 'The Lord\'s Prayer',    gradient: ['#1B3A6B', '#2E6BAA'] },
  { bookId: 'matthew',      chapter: 28, titlePt: 'A Grande Comissão',   titleEn: 'The Great Commission',  gradient: ['#1B5A3A', '#2E9E6B'] },
  { bookId: 'john',         chapter: 1,  titlePt: 'O Verbo',             titleEn: 'The Word',              gradient: ['#2A1B4A', '#5B3FA0'] },
  { bookId: 'john',         chapter: 3,  titlePt: 'Nascer de Novo',      titleEn: 'Born Again',            gradient: ['#6B3A1B', '#A0582A'] },
  { bookId: 'john',         chapter: 14, titlePt: 'Eu Sou o Caminho',    titleEn: 'I Am the Way',          gradient: ['#1B3A4A', '#2E6B8E'] },
  { bookId: 'john',         chapter: 15, titlePt: 'A Videira',           titleEn: 'The True Vine',         gradient: ['#2A4A1B', '#4E8E2E'] },
  { bookId: 'romans',       chapter: 8,  titlePt: 'Mais que Vencedores', titleEn: 'More Than Conquerors',  gradient: ['#1B4A3A', '#2E8B6E'] },
  { bookId: 'romans',       chapter: 12, titlePt: 'Transformados',       titleEn: 'Living Sacrifice',      gradient: ['#3A4A1B', '#6B8E2E'] },
  { bookId: 'philippians',  chapter: 4,  titlePt: 'A Paz de Deus',       titleEn: 'Peace of God',          gradient: ['#1B3A5A', '#2E6B9E'] },
  { bookId: '1corinthians', chapter: 13, titlePt: 'O Amor',              titleEn: 'The Love Chapter',      gradient: ['#6B1B3A', '#AA3F5F'] },
  { bookId: '1corinthians', chapter: 15, titlePt: 'A Ressurreição',      titleEn: 'The Resurrection',      gradient: ['#4A1B1B', '#9E3F3F'] },
];

export function searchBible(query: string): Array<{ bookId: string; chapter: number; verse: BibleVerse }> {
  const q = query.toLowerCase().trim();
  if (q.length < 3) return [];
  const results: Array<{ bookId: string; chapter: number; verse: BibleVerse }> = [];
  for (const book of Object.values(BIBLE_DATA)) {
    for (const [chapterNum, verses] of Object.entries(book.chapters)) {
      for (const verse of verses) {
        if (verse.en.toLowerCase().includes(q) || verse.pt.toLowerCase().includes(q)) {
          results.push({ bookId: book.id, chapter: Number(chapterNum), verse });
        }
      }
    }
  }
  return results.slice(0, 40);
}
