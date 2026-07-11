---
name: Unified audio engine architecture (mobile)
description: How the shared voice/TTS engine (AudioContext) is structured — queueKey sharing pattern and gesture-slider gotcha — for anyone extending playback UI.
---

## queueKey lets many lightweight player UIs share one engine safely
A single global `AudioProvider` (context/AudioContext.tsx) is the only thing that ever touches expo-av/expo-speech, wrapped once around the app in `app/_layout.tsx`. Each "player" surface (chapter reading, daily verse card, daily verse screen, devotional modal, vocabulary word buttons) does NOT own its own player state. Instead every surface that can trigger playback tags its call with a unique string `queueKey` (e.g. `` `daily-verse:${todayKey()}` ``, `` `daily-devotional:${todayKey()}:${lang}` ``, chapter-specific key). A UI component compares its own key against the engine's current `queueKey` to decide whether it is the "active" player and should render as expanded/highlighted.

**Why:** Without this, either every screen needs its own player instance (multiple audio sources fighting to play) or the app needs heavy prop-drilling of playback state through the navigation tree. Reusing the *same key string* for the same logical content (e.g. home card and daily screen both use `daily-verse:${todayKey()}`) is what keeps state in sync across screens showing the same content.

**How to apply:** When adding a new place that can play audio, mint a descriptive, content-scoped `queueKey`; don't invent per-screen ad hoc keys if another screen already plays the same content — reuse its key string exactly so both surfaces reflect the same active/inactive/progress state.

## GestureSlider needs a Reanimated shared value for tracked width, not a ref
`components/GestureSlider.tsx` drives both the playback progress bar and the speed slider via `react-native-gesture-handler`'s `Gesture.Pan()` with `.runOnJS(true)`. The gesture callback and the derived worklet styles both need the slider's measured width. A plain React ref for width will NOT be visible/reactive to the worklet-driven style — it must be stored in a Reanimated shared value (`useSharedValue`) that gets updated `onLayout`, or drag position calculations silently use a stale/zero width.

**Why:** `.runOnJS(true)` keeps the callback on the JS thread for simplicity, but the resulting style updates are still applied via Reanimated's `useAnimatedStyle`, which only reacts to shared values — not plain refs/state captured by closure.

**How to apply:** Any new gesture-driven slider/draggable UI in this app should track its container size in a shared value, not a ref, before wiring pan gesture math to it.

## Pausing while a track is still loading needs a durable "desired state" flag, not a per-call reset
`Audio.Sound.createAsync` is called with `shouldPlay: true`, so it starts playing the moment it resolves — a `pause()` tapped while that fetch/load is still in flight has nothing to act on yet and gets silently overridden when load finishes. A `pausePendingRef` flag (checked right after `createAsync` resolves, and consulted inside `setOnPlaybackStatusUpdate`) fixes the single-track case.

**Why:** The harder case is auto-advance: internal `advance()`→`loadAndPlay(nextIndex)` calls (queue moving to the next item on natural completion) must NOT reset this flag, or a pause tapped a moment earlier — one that raced a very short/fast-finishing track's natural end — gets silently dropped and playback continues into the next item anyway. Only *explicit* user "play" entry points (`playQueue`, `resume`, `next`, `previous`, `togglePlayPause`'s idle branch) should reset the flag; internal continuation must inherit it.

**How to apply:** Any queue-advancing playback engine needs this distinction — reset "should be playing" intent only on user-initiated play actions, never on internal continuation between queue items — or pause becomes flaky specifically on short/fast content.
