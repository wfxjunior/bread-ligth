/**
 * PrayerContext — local-first persistence and state for the Prayer Journey.
 *
 * Everything is stored on-device (AsyncStorage) under one key, so prayers work
 * fully offline and never leave the device — privacy is 'private' for every
 * prayer today. The shape (id'd records + timelines + privacy field) is
 * designed so a future cloud-sync layer can upsert without migration.
 */
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  dayKey, newPrayerId, prayerStreak,
  type Prayer, type PrayerCategory, type PrayerPrivacy, type PrayerReminder, type PrayerStatus,
} from '@/constants/prayers';

const STORAGE_KEY = '@bibliaeN:prayerJourney';

interface PrayerStore {
  prayers: Prayer[];
  /** Local day-keys on which the user tapped "I prayed" — powers the streak. */
  prayedDays: string[];
}

export interface NewPrayerInput {
  title: string;
  description: string;
  category: PrayerCategory;
  privacy: PrayerPrivacy;
  reminder: PrayerReminder;
  favorite: boolean;
  scripture: { bookId: string; chapter: number } | null;
}

interface PrayerContextValue {
  prayers: Prayer[];
  hydrated: boolean;
  stats: { active: number; answered: number; favorites: number; streak: number };
  addPrayer: (input: NewPrayerInput) => Prayer;
  updatePrayer: (id: string, patch: Partial<Pick<Prayer, 'title' | 'description' | 'category' | 'reminder' | 'scripture' | 'privacy'>>) => void;
  setStatus: (id: string, status: Exclude<PrayerStatus, 'answered'>) => void;
  /** The answered flow: records the testimony, the date, and the Memorial. */
  markAnswered: (id: string, testimony: string) => void;
  markPrayed: (id: string) => void;
  addNote: (id: string, text: string) => void;
  toggleFavorite: (id: string) => void;
  deletePrayer: (id: string) => void;
}

const PrayerCtx = createContext<PrayerContextValue | null>(null);

export function PrayerProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<PrayerStore>({ prayers: [], prayedDays: [] });
  const [hydrated, setHydrated] = useState(false);
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const parsed = JSON.parse(raw) as PrayerStore;
          if (Array.isArray(parsed?.prayers)) {
            setStore({ prayers: parsed.prayers, prayedDays: parsed.prayedDays ?? [] });
          }
        }
      })
      .catch(() => {})
      .finally(() => setHydrated(true));
  }, []);

  // Debounced persistence — one write per burst of edits.
  const persist = useCallback((next: PrayerStore) => {
    setStore(next);
    if (persistTimer.current) clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
    }, 250);
  }, []);

  const mutatePrayer = useCallback(
    (id: string, fn: (p: Prayer) => Prayer) => {
      setStore((prev) => {
        const next: PrayerStore = { ...prev, prayers: prev.prayers.map((p) => (p.id === id ? fn(p) : p)) };
        if (persistTimer.current) clearTimeout(persistTimer.current);
        persistTimer.current = setTimeout(() => {
          AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
        }, 250);
        return next;
      });
    },
    [],
  );

  const addPrayer = useCallback(
    (input: NewPrayerInput): Prayer => {
      const now = new Date().toISOString();
      const prayer: Prayer = {
        id: newPrayerId(),
        title: input.title.trim(),
        description: input.description.trim(),
        category: input.category,
        status: 'praying',
        privacy: input.privacy,
        favorite: input.favorite,
        reminder: input.reminder,
        createdAt: now,
        answeredAt: null,
        lastPrayedAt: now,
        scripture: input.scripture,
        testimony: null,
        notes: [],
        timeline: [{ at: now, type: 'created' }],
      };
      persist({ ...storeRef.current, prayers: [prayer, ...storeRef.current.prayers] });
      return prayer;
    },
    [persist],
  );

  // Keep a ref of the latest store for addPrayer (called outside setState).
  const storeRef = useRef(store);
  useEffect(() => { storeRef.current = store; }, [store]);

  const updatePrayer: PrayerContextValue['updatePrayer'] = useCallback(
    (id, patch) => mutatePrayer(id, (p) => ({ ...p, ...patch })),
    [mutatePrayer],
  );

  const setStatus: PrayerContextValue['setStatus'] = useCallback(
    (id, status) =>
      mutatePrayer(id, (p) =>
        p.status === status
          ? p
          : {
              ...p,
              status,
              // answeredAt/testimony are kept even when moving away from
              // 'answered' — a Memorial, once built, is not torn down.
              timeline: [...p.timeline, { at: new Date().toISOString(), type: 'status', status }],
            },
      ),
    [mutatePrayer],
  );

  const markAnswered: PrayerContextValue['markAnswered'] = useCallback(
    (id, testimony) =>
      mutatePrayer(id, (p) => ({
        ...p,
        status: 'answered',
        answeredAt: p.answeredAt ?? new Date().toISOString(),
        testimony: testimony.trim() || p.testimony,
        timeline: [...p.timeline, { at: new Date().toISOString(), type: 'answered', status: 'answered' }],
      })),
    [mutatePrayer],
  );

  const markPrayed: PrayerContextValue['markPrayed'] = useCallback(
    (id) => {
      const today = dayKey();
      setStore((prev) => {
        const prayedDays = prev.prayedDays.includes(today) ? prev.prayedDays : [...prev.prayedDays, today];
        const next: PrayerStore = {
          prayedDays,
          prayers: prev.prayers.map((p) =>
            p.id === id
              ? { ...p, lastPrayedAt: new Date().toISOString(), timeline: [...p.timeline, { at: new Date().toISOString(), type: 'prayed' as const }] }
              : p,
          ),
        };
        if (persistTimer.current) clearTimeout(persistTimer.current);
        persistTimer.current = setTimeout(() => AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {}), 250);
        return next;
      });
    },
    [],
  );

  const addNote: PrayerContextValue['addNote'] = useCallback(
    (id, text) =>
      mutatePrayer(id, (p) => ({
        ...p,
        notes: [...p.notes, { at: new Date().toISOString(), text: text.trim() }],
        timeline: [...p.timeline, { at: new Date().toISOString(), type: 'note' }],
      })),
    [mutatePrayer],
  );

  const toggleFavorite: PrayerContextValue['toggleFavorite'] = useCallback(
    (id) => mutatePrayer(id, (p) => ({ ...p, favorite: !p.favorite })),
    [mutatePrayer],
  );

  const deletePrayer: PrayerContextValue['deletePrayer'] = useCallback(
    (id) => {
      setStore((prev) => {
        const next: PrayerStore = { ...prev, prayers: prev.prayers.filter((p) => p.id !== id) };
        if (persistTimer.current) clearTimeout(persistTimer.current);
        persistTimer.current = setTimeout(() => AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {}), 250);
        return next;
      });
    },
    [],
  );

  const stats = {
    active: store.prayers.filter((p) => p.status === 'praying' || p.status === 'waiting').length,
    answered: store.prayers.filter((p) => p.status === 'answered').length,
    favorites: store.prayers.filter((p) => p.favorite && p.status !== 'archived').length,
    streak: prayerStreak(store.prayedDays),
  };

  return (
    <PrayerCtx.Provider
      value={{ prayers: store.prayers, hydrated, stats, addPrayer, updatePrayer, setStatus, markAnswered, markPrayed, addNote, toggleFavorite, deletePrayer }}
    >
      {children}
    </PrayerCtx.Provider>
  );
}

export function usePrayers(): PrayerContextValue {
  const ctx = useContext(PrayerCtx);
  if (!ctx) throw new Error('usePrayers must be used within a PrayerProvider');
  return ctx;
}
