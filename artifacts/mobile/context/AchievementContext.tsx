import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  applyEvent, EMPTY_STATE,
  type AchievementEvent, type EngineState, type NewHonor,
} from '@/constants/achievements';

const STORAGE_KEY = '@bibliaeN:journeyHonors';
const FEATURED_KEY = '@bibliaeN:featuredMedals';

// ── Module-level event bus ────────────────────────────────────────────────────
// Anything (contexts, screens, components) publishes verified product events
// here without needing a hook or provider ordering. The provider below is the
// single subscriber — the centralized AchievementEngine the spec asks for.
type Listener = (e: AchievementEvent) => void;
let listener: Listener | null = null;
const preMountQueue: AchievementEvent[] = [];

export function publishAchievementEvent(e: AchievementEvent): void {
  if (listener) listener(e);
  else preMountQueue.push(e); // events fired before hydration are not lost
}

interface AchievementContextValue {
  state: EngineState;
  /** Honors earned this session, not yet shown to the reader. */
  pendingUnlocks: NewHonor[];
  /** Marks the current pending unlocks as seen (after the unlock sheet). */
  acknowledgeUnlocks: () => void;
  /** Up to 3 medal ids featured on the Journey header. */
  featured: string[];
  toggleFeatured: (id: string) => void;
}

const Ctx = createContext<AchievementContextValue | null>(null);

export function AchievementProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<EngineState>(EMPTY_STATE);
  const [pendingUnlocks, setPendingUnlocks] = useState<NewHonor[]>([]);
  const [featured, setFeatured] = useState<string[]>([]);
  const stateRef = useRef(state);
  stateRef.current = state;
  const hydratedRef = useRef(false);

  // Hydrate persisted engine state, then attach the bus and drain the queue.
  useEffect(() => {
    (async () => {
      try {
        const [raw, featRaw] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(FEATURED_KEY),
        ]);
        if (raw) {
          const parsed = JSON.parse(raw) as EngineState;
          if (parsed?.metrics && parsed?.earned) {
            stateRef.current = parsed;
            setState(parsed);
          }
        }
        if (featRaw) setFeatured(JSON.parse(featRaw) as string[]);
      } catch { /* corrupt storage → fresh state */ }
      hydratedRef.current = true;

      listener = (e: AchievementEvent) => {
        const { state: next, newlyEarned } = applyEvent(stateRef.current, e);
        if (next === stateRef.current) return;
        stateRef.current = next;
        setState(next);
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
        if (newlyEarned.length) setPendingUnlocks(prev => [...prev, ...newlyEarned]);
      };
      // Drain anything published during startup.
      while (preMountQueue.length) listener(preMountQueue.shift()!);
    })();
    return () => { listener = null; };
  }, []);

  const acknowledgeUnlocks = useCallback(() => setPendingUnlocks([]), []);

  const toggleFeatured = useCallback((id: string) => {
    setFeatured(prev => {
      const next = prev.includes(id)
        ? prev.filter(f => f !== id)
        : prev.length >= 3 ? prev : [...prev, id];
      AsyncStorage.setItem(FEATURED_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  return (
    <Ctx.Provider value={{ state, pendingUnlocks, acknowledgeUnlocks, featured, toggleFeatured }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAchievements(): AchievementContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAchievements must be used within AchievementProvider');
  return ctx;
}
