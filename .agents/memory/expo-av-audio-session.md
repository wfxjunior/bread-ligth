---
name: expo-av shared audio session leaks between recording and playback
description: Why TTS/audio playback can silently produce no sound on real iOS devices after a recording feature runs, and how to prevent it.
---

`expo-av`'s `Audio.setAudioModeAsync` configures one **process-wide** audio session, not a per-component one. Any feature that records (e.g. a pronunciation-practice mic recorder) must set `allowsRecordingIOS: true` to record — but if that never gets reverted, the session stays in recording mode afterward.

**Symptom:** a separate playback feature (e.g. TTS "Listen" button) calls `Audio.Sound.createAsync({ uri }, { shouldPlay: true })`, the promise resolves fine, `isPlaying` becomes `true`, the UI shows a pause icon — but no audible sound comes out. This is confusing because there is no error anywhere; the audio session is just routed/ducked incorrectly by iOS.

**Why:** `allowsRecordingIOS: true` left set from a prior recording session affects how iOS's shared `AVAudioSession` routes output for every subsequent playback, independent of which component started it.

**How to apply:**
- Any recording flow must reset `allowsRecordingIOS: false` when recording stops — on success, on error, *and* when the recording UI is dismissed/unmounted mid-recording (all three paths, not just the happy path).
- Defensively, any shared playback engine (e.g. a global AudioProvider) should also reset `allowsRecordingIOS: false` immediately before starting playback each time, as a second line of defense — cheap, and it recovers even if some other code path forgot to reset it.
