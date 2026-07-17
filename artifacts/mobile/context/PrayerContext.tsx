/**
 * PrayerContext — local-first persistence and state for the Prayer Journey.
 *
 * Everything lives on-device (AsyncStorage) first, so prayers work fully
 * offline. When the user is signed in, a quiet background sync mirrors their
 * OWN prayers to their account on the api-server (backup + cross-device):
 * pull-merge on start, debounced push after edits, last-write-wins per prayer
 * via `updatedAt`, deletions carried as tombstone ids. Sync failures are
 * silent — the device copy is always authoritative for the UI.
 */
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@clerk/expo';
import {
  dayKey, newPrayerId, prayerStreak,
  type Prayer, type PrayerCategory, type PrayerPrivacy, type PrayerReminder, type PrayerStatus,
} from '@/constants/prayers';

const STORAGE_KEY = '@bibliaeN:prayerJourney';
const _domain = process.env.EXPO_PUBLIC_DOMAIN;
const API_BASE = _domain ? `https://${_domain}/api` : null;

interface PrayerStore {
  prayers: Prayer[];
  /** Local day-keys on which the user tapped "I prayed" — powers the streak. */
  prayedDays: string[];
  /** Ids deleted locally but not yet confirmed by the server (tombstones). */
  pendingDeletes: string[];
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
  const [store, setStore] = useState<PrayerStore>({ prayers: [], prayedDays: [], pendingDeletes: [] });
  const [hydrated, setHydrated] = useState(false);
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isSignedIn, getToken } = useAuth();

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<PrayerStore>;
          if (Array.isArray(parsed?.prayers)) {
            setStore({
              // Migration: records created before cloud sync get updatedAt.
              prayers: parsed.prayers.map((p) => ({ ...p, updatedAt: p.updatedAt ?? p.createdAt })),
              prayedDays: parsed.prayedDays ?? [],
              pendingDeletes: parsed.pendingDeletes ?? [],
            });
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

  // Latest store for callbacks that run outside setState (addPrayer, sync).
  const storeRef = useRef(store);
  useEffect(() => { storeRef.current = store; }, [store]);

  // ── Cloud sync (quiet, best-effort) ─────────────────────────────────────────
  // Push local state, receive the server's merged canonical set, adopt it.
  // Runs after hydration when signed in, and (debounced) after every edit.
  const syncingRef = useRef(false);
  const syncNow = useCallback(async () => {
    if (!API_BASE || !isSignedIn || syncingRef.current) return;
    syncingRef.current = true;
    try {
      const token = await getToken();
      if (!token) return;
      const local = storeRef.current;
      const res = await fetch(`${API_BASE}/prayers/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          prayers: local.prayers,
          deletedIds: local.pendingDeletes,
          prayedDays: local.prayedDays,
        }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as { prayers?: Prayer[]; prayedDays?: string[] };
      if (!Array.isArray(data.prayers)) return;
      // Adopt the canonical set, but keep any local edit made while the
      // request was in flight (newer updatedAt wins).
      setStore((prev) => {
        const byId = new Map(data.prayers!.map((p) => [p.id, { ...p, updatedAt: p.updatedAt ?? p.createdAt }]));
        for (const p of prev.prayers) {
          const server = byId.get(p.id);
          if (!server || server.updatedAt < p.updatedAt) byId.set(p.id, p);
        }
        for (const del of prev.pendingDeletes) byId.delete(del);
        const next: PrayerStore = {
          prayers: [...byId.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
          prayedDays: [...new Set([...(data.prayedDays ?? []), ...prev.prayedDays])],
          pendingDeletes: [], // server has recorded the tombstones
        };
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
    } catch {
      // Offline or server unavailable — the device copy remains authoritative.
    } finally {
      syncingRef.current = false;
    }
  }, [isSignedIn, getToken]);

  const scheduleSync = useCallback(() => {
    if (!API_BASE || !isSignedIn) return;
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => { syncNow(); }, 4000);
  }, [isSignedIn, syncNow]);

  // First sync after hydration / sign-in.
  useEffect(() => {
    if (hydrated && isSignedIn) syncNow();
  }, [hydrated, isSignedIn, syncNow]);

  const mutatePrayer = useCallback(
    (id: string, fn: (p: Prayer) => Prayer) => {
      setStore((prev) => {
        const next: PrayerStore = {
          ...prev,
          prayers: prev.prayers.map((p) => (p.id === id ? { ...fn(p), updatedAt: new Date().toISOString() } : p)),
        };
        if (persistTimer.current) clearTimeout(persistTimer.current);
        persistTimer.current = setTimeout(() => {
          AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
        }, 250);
        return next;
      });
      scheduleSync();
    },
    [scheduleSync],
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
        updatedAt: now,
        answeredAt: null,
        lastPrayedAt: now,
        scripture: input.scripture,
        testimony: null,
        notes: [],
        timeline: [{ at: now, type: 'created' }],
      };
      persist({ ...storeRef.current, prayers: [prayer, ...storeRef.current.prayers] });
      scheduleSync();
      return prayer;
    },
    [persist, scheduleSync],
  );

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
      const now = new Date().toISOString();
      setStore((prev) => {
        const prayedDays = prev.prayedDays.includes(today) ? prev.prayedDays : [...prev.prayedDays, today];
        const next: PrayerStore = {
          ...prev,
          prayedDays,
          prayers: prev.prayers.map((p) =>
            p.id === id
              ? { ...p, lastPrayedAt: now, updatedAt: now, timeline: [...p.timeline, { at: now, type: 'prayed' as const }] }
              : p,
          ),
        };
        if (persistTimer.current) clearTimeout(persistTimer.current);
        persistTimer.current = setTimeout(() => AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {}), 250);
        return next;
      });
      scheduleSync();
    },
    [scheduleSync],
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
        const next: PrayerStore = {
          ...prev,
          prayers: prev.prayers.filter((p) => p.id !== id),
          // Tombstone until the server confirms, so the deletion reaches
          // every signed-in device instead of resurrecting on next pull.
          pendingDeletes: prev.pendingDeletes.includes(id) ? prev.pendingDeletes : [...prev.pendingDeletes, id],
        };
        if (persistTimer.current) clearTimeout(persistTimer.current);
        persistTimer.current = setTimeout(() => AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {}), 250);
        return next;
      });
      scheduleSync();
    },
    [scheduleSync],
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
