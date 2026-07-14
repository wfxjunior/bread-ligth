---
name: Prefetch cellular gating
description: How background verse-audio prefetch respects a Wi-Fi-only setting, and what it intentionally does NOT cover.
---

`expo-network`'s `getNetworkStateAsync()` is queried live on each prefetch pass (not cached at playback start), since Wi-Fi↔cellular can change mid-chapter.

The "Prefetch on Wi-Fi only" setting only gates the lookahead prefetch (`prefetchQueueAhead` in AudioContext.tsx). It intentionally does NOT gate `downloadAndCacheTts` when called directly for the verse the user is actively playing — current-verse playback must never be blocked by a network-type check, only the background lookahead is skippable.

**Why:** the task scope was "avoid burning data on *background* prefetching", not restricting playback itself; blocking active playback on cellular would be a regression users didn't ask for.

**How to apply:** if extending this feature (e.g. a cellular-data warning before intentional playback), keep the constraint separate — check connection type only around the prefetch call site, not inside downloadAndCacheTts itself.
