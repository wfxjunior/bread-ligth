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

import { johnBook } from './bible/john';
import { proverbsBook } from './bible/proverbs';
import { genesisBook } from './bible/genesis';
import { philippiansBook } from './bible/philippians';
import { romansBook } from './bible/romans';
import { firstCorinthiansBook } from './bible/1corinthians';
import { matthewBook } from './bible/matthew';
import { psalmsBook } from './bible/psalms';

export const BIBLE_DATA: Record<string, BibleBook> = {
  genesis: genesisBook,
  psalms: psalmsBook,
  proverbs: proverbsBook,
  matthew: matthewBook,
  john: johnBook,
  romans: romansBook,
  philippians: philippiansBook,
  '1corinthians': firstCorinthiansBook,
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
