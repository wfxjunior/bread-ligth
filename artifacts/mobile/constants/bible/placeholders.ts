import type { BibleBook } from '../bibleData';

// ── Placeholder entries for books whose full text hasn't been transcribed yet ──
// These exist so the bookshelf can render every canonical book with its real
// name/cover while the actual chapter-by-chapter content is filled in over
// time (see the 8 fully-written books in sibling files for the target shape).
// Each placeholder carries exactly one chapter with one verse so `LeatherBook`
// (which needs `book.chapters` to compute progress/chapter counts) has
// something to read, and so opening the book doesn't crash — but the verse
// text is explicitly a "coming soon" notice, never fabricated scripture.
const COMING_SOON: BibleBook['chapters'] = {
  1: [{ v: 1, en: 'This book is being added soon.', pt: 'Este livro está sendo adicionado em breve.' }],
};

function placeholder(id: string, name: string, englishName: string, testament: 'old' | 'new'): BibleBook {
  return { id, name, englishName, testament, chapters: COMING_SOON };
}

export const PLACEHOLDER_BOOKS: Record<string, BibleBook> = {
  // ── Old Testament ──
  exodus:          placeholder('exodus',          'Êxodo',              'Exodus',          'old'),
  leviticus:       placeholder('leviticus',       'Levítico',           'Leviticus',       'old'),
  numbers:         placeholder('numbers',         'Números',            'Numbers',         'old'),
  deuteronomy:     placeholder('deuteronomy',     'Deuteronômio',       'Deuteronomy',     'old'),
  joshua:          placeholder('joshua',          'Josué',              'Joshua',          'old'),
  judges:          placeholder('judges',          'Juízes',             'Judges',          'old'),
  ruth:            placeholder('ruth',            'Rute',               'Ruth',            'old'),
  '1samuel':       placeholder('1samuel',         '1 Samuel',           '1 Samuel',        'old'),
  '2samuel':       placeholder('2samuel',         '2 Samuel',           '2 Samuel',        'old'),
  '1kings':        placeholder('1kings',          '1 Reis',             '1 Kings',         'old'),
  '2kings':        placeholder('2kings',          '2 Reis',             '2 Kings',         'old'),
  '1chronicles':   placeholder('1chronicles',     '1 Crônicas',         '1 Chronicles',    'old'),
  '2chronicles':   placeholder('2chronicles',     '2 Crônicas',         '2 Chronicles',    'old'),
  ezra:            placeholder('ezra',            'Esdras',             'Ezra',            'old'),
  nehemiah:        placeholder('nehemiah',        'Neemias',            'Nehemiah',        'old'),
  esther:          placeholder('esther',          'Ester',              'Esther',          'old'),
  job:             placeholder('job',             'Jó',                 'Job',             'old'),
  ecclesiastes:    placeholder('ecclesiastes',    'Eclesiastes',        'Ecclesiastes',    'old'),
  songofsolomon:   placeholder('songofsolomon',   'Cânticos',           'Song of Solomon', 'old'),
  isaiah:          placeholder('isaiah',          'Isaías',             'Isaiah',          'old'),
  jeremiah:        placeholder('jeremiah',        'Jeremias',           'Jeremiah',        'old'),
  lamentations:    placeholder('lamentations',    'Lamentações',        'Lamentations',    'old'),
  ezekiel:         placeholder('ezekiel',         'Ezequiel',           'Ezekiel',         'old'),
  daniel:          placeholder('daniel',          'Daniel',             'Daniel',          'old'),
  hosea:           placeholder('hosea',           'Oseias',             'Hosea',           'old'),
  joel:            placeholder('joel',            'Joel',               'Joel',            'old'),
  amos:            placeholder('amos',            'Amós',               'Amos',            'old'),
  obadiah:         placeholder('obadiah',         'Obadias',            'Obadiah',         'old'),
  jonah:           placeholder('jonah',           'Jonas',              'Jonah',           'old'),
  micah:           placeholder('micah',           'Miquéias',           'Micah',           'old'),
  nahum:           placeholder('nahum',           'Naum',               'Nahum',           'old'),
  habakkuk:        placeholder('habakkuk',        'Habacuque',          'Habakkuk',        'old'),
  zephaniah:       placeholder('zephaniah',       'Sofonias',           'Zephaniah',       'old'),
  haggai:          placeholder('haggai',          'Ageu',               'Haggai',          'old'),
  zechariah:       placeholder('zechariah',       'Zacarias',           'Zechariah',       'old'),
  malachi:         placeholder('malachi',         'Malaquias',          'Malachi',         'old'),

  // ── New Testament ──
  mark:            placeholder('mark',            'Marcos',             'Mark',            'new'),
  luke:            placeholder('luke',            'Lucas',              'Luke',            'new'),
  acts:            placeholder('acts',             'Atos',              'Acts',            'new'),
  '2corinthians':  placeholder('2corinthians',    '2 Coríntios',        '2 Corinthians',   'new'),
  galatians:       placeholder('galatians',       'Gálatas',            'Galatians',       'new'),
  ephesians:       placeholder('ephesians',       'Efésios',            'Ephesians',       'new'),
  colossians:      placeholder('colossians',      'Colossenses',        'Colossians',      'new'),
  '1thessalonians': placeholder('1thessalonians', '1 Tessalonicenses',  '1 Thessalonians', 'new'),
  '2thessalonians': placeholder('2thessalonians', '2 Tessalonicenses',  '2 Thessalonians', 'new'),
  '1timothy':      placeholder('1timothy',        '1 Timóteo',          '1 Timothy',       'new'),
  '2timothy':      placeholder('2timothy',        '2 Timóteo',          '2 Timothy',       'new'),
  titus:           placeholder('titus',           'Tito',               'Titus',           'new'),
  philemon:        placeholder('philemon',        'Filemom',            'Philemon',        'new'),
  hebrews:         placeholder('hebrews',         'Hebreus',            'Hebrews',         'new'),
  james:           placeholder('james',           'Tiago',              'James',           'new'),
  '1peter':        placeholder('1peter',          '1 Pedro',            '1 Peter',         'new'),
  '2peter':        placeholder('2peter',          '2 Pedro',            '2 Peter',         'new'),
  '1john':         placeholder('1john',           '1 João',             '1 John',          'new'),
  '2john':         placeholder('2john',           '2 João',             '2 John',          'new'),
  '3john':         placeholder('3john',           '3 João',             '3 John',          'new'),
  jude:            placeholder('jude',            'Judas',              'Jude',            'new'),
  revelation:      placeholder('revelation',      'Apocalipse',         'Revelation',      'new'),
};
