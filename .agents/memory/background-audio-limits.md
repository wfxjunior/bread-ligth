---
name: Background audio & lock-screen control limits (Expo Go managed workflow)
description: What is and isn't achievable for background playback and lock-screen media controls without a custom dev client.
---

`staysActiveInBackground: true` in expo-av's `Audio.setAudioModeAsync` is enough to keep audio
(including auto-advance across a queue) playing when the app is backgrounded or the device is
locked — Expo Go's own Info.plist already declares the `audio` UIBackgroundMode, so this works
in the managed workflow without ejecting. For standalone/EAS builds, `ios.infoPlist.UIBackgroundModes: ["audio"]`
must also be set in app.json, and Android needs `FOREGROUND_SERVICE` + `FOREGROUND_SERVICE_MEDIA_PLAYBACK`
permissions.

**Why this matters:** `Audio.setAudioModeAsync` replaces the whole native audio mode on each call
rather than merging with the previous one — every call site that sets audio mode must repeat
`staysActiveInBackground: true`, or a later call (e.g. right before playback starts) silently
resets it to the default and background playback breaks again.

**Lock-screen/notification transport controls (Now Playing card, tappable play/pause/next) are
NOT reliably available** in neither expo-av nor expo-audio (SDK 54, expo-audio v1.1.1) — there is
no public API to register MPNowPlayingInfoCenter / MPRemoteCommandCenter (iOS) or a MediaSession
(Android) with Previous/Next callbacks. The Expo team's own guidance (GitHub discussion #43351,
Feb–Mar 2026) points to `react-native-track-player` as the standard solution, which requires
native linking — i.e. a custom EAS dev client, not Expo Go. Don't attempt to fake this with JS-only
code; treat it as out of scope until the project has a dev-client build pipeline.
