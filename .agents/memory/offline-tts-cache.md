---
name: On-device TTS audio cache
description: How offline playback of premium TTS voice audio is cached on the mobile app, and the expo-file-system API quirk that affects it.
---

Mobile app (artifacts/mobile/context/AudioContext.tsx) caches OpenAI TTS audio to disk (expo-file-system cache dir) keyed by sha256(voice+text), with an AsyncStorage index tracking size/lastAccess and LRU eviction over a byte cap. Playback checks the on-device cache before hitting the network, so previously-heard verses stay in the premium voice offline instead of degrading to expo-speech.

**Why:** the project's SDK 54 `expo-file-system` ships a new File/Directory-object API by default; the familiar promise-based functions (`downloadAsync`, `getInfoAsync`, `cacheDirectory`, `makeDirectoryAsync`, `deleteAsync`) only exist under the `expo-file-system/legacy` subpath import.

**How to apply:** when adding more file-system code to this app (or any Expo SDK 54+ project), import from `expo-file-system/legacy` unless deliberately adopting the new File/Directory API — mixing them silently breaks `FileSystem.cacheDirectory`/`downloadAsync` calls (undefined/typeError) rather than erroring at compile time.
