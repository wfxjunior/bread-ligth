import type { BibleBook } from '../bibleData';
import { MATTHEW_CH1_14 } from './matthew-ch1-14';
import { MATTHEW_CH15_28 } from './matthew-ch15-28';

export const matthewBook: BibleBook = {
  id: 'matthew',
  name: 'Mateus',
  englishName: 'Matthew',
  testament: 'new',
  chapters: {
    ...MATTHEW_CH1_14,
    ...MATTHEW_CH15_28,
  },
};
