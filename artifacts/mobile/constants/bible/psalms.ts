import type { BibleBook } from '../bibleData';
import { PSALMS_CH1_50 } from './psalms-ch1-50';
import { PSALMS_CH51_100 } from './psalms-ch51-100';
import { PSALMS_CH101_150 } from './psalms-ch101-150';

export const psalmsBook: BibleBook = {
  id: 'psalms',
  name: 'Salmos',
  englishName: 'Psalms',
  testament: 'old',
  chapters: {
    ...PSALMS_CH1_50,
    ...PSALMS_CH51_100,
    ...PSALMS_CH101_150,
  },
};
