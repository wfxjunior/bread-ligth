// ── Pronunciation practice — gentle, deterministic feedback ────────────────────
// No scores, no shaming: we compare the transcript against the target verse and
// describe clarity (words recognized) and rhythm (pacing) in encouraging terms.

export type FeedbackTier = 'great' | 'good' | 'keep_practicing';

export interface WordMatch {
  word: string;
  recognized: boolean;
}

export interface PronunciationResult {
  clarityRatio: number;      // 0..1 — share of target words recognized
  clarityTier: FeedbackTier;
  words: WordMatch[];        // target words annotated with recognition
  rhythmTier: FeedbackTier;
  wordsPerMinute: number | null;
}

function normalize(word: string): string {
  return word.toLowerCase().replace(/[^a-z']/g, '');
}

function tierFromRatio(ratio: number): FeedbackTier {
  if (ratio >= 0.8) return 'great';
  if (ratio >= 0.5) return 'good';
  return 'keep_practicing';
}

// Natural spoken English sits around 130–170 wpm; be generous with the "great" band.
function tierFromWpm(wpm: number): FeedbackTier {
  if (wpm >= 90 && wpm <= 200) return 'great';
  if (wpm >= 60 && wpm <= 240) return 'good';
  return 'keep_practicing';
}

/**
 * Compares a transcript against the target verse text and produces gentle,
 * respectful feedback — never a shaming score.
 */
export function evaluatePronunciation(
  targetText: string,
  transcript: string,
  durationMs?: number,
): PronunciationResult {
  const targetWords     = targetText.split(/\s+/).filter(Boolean);
  const transcriptWords = new Set(transcript.split(/\s+/).filter(Boolean).map(normalize));

  const words: WordMatch[] = targetWords.map(raw => ({
    word: raw,
    recognized: transcriptWords.has(normalize(raw)),
  }));

  const recognizedCount = words.filter(w => w.recognized).length;
  const clarityRatio = targetWords.length > 0 ? recognizedCount / targetWords.length : 0;

  let wordsPerMinute: number | null = null;
  let rhythmTier: FeedbackTier = 'good';
  if (durationMs && durationMs > 0) {
    wordsPerMinute = Math.round((targetWords.length / (durationMs / 1000)) * 60);
    rhythmTier = tierFromWpm(wordsPerMinute);
  }

  return {
    clarityRatio,
    clarityTier: tierFromRatio(clarityRatio),
    words,
    rhythmTier,
    wordsPerMinute,
  };
}
