import React from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useLanguage } from '@/context/LanguageContext';
import { useAudio, type AudioQueueItem } from '@/context/AudioContext';
import { GestureSlider } from './GestureSlider';

// Podcast-style preset speeds. 0.7 is the language learner's slow-listening
// speed; 1.0 is the default. Values within the engine's 0.5–2.0 range.
const RATE_PRESETS = [0.7, 1.0, 1.2, 1.5, 1.7, 2.0] as const;

interface PlayerPalette {
  card?: string;
  border?: string;
  foreground?: string;
  mutedForeground?: string;
  primary?: string;
  primaryForeground?: string;
  accent?: string;
}

interface AudioPlayerProps {
  /** Items this player instance controls; only enqueued when not already active. */
  items: AudioQueueItem[];
  /** Unique key identifying this player's content — lets multiple players share the one engine. */
  queueKey: string;
  startIndex?: number;
  title?: string;
  /** Compact renders only the play button + progress bar (used on Home, inline contexts). */
  compact?: boolean;
  /** Optional palette overrides for screens with a fixed (non reading-theme) palette. */
  palette?: PlayerPalette;
}

/**
 * AudioPlayer — the single, reusable BreadLight-styled player.
 * Reflects the shared audio engine's state for its own `queueKey`; tapping
 * play when idle enqueues `items` into the engine, which stops whatever
 * else was playing (only one audio source ever plays at once).
 */
export default function AudioPlayer({ items, queueKey, startIndex = 0, title, compact = false, palette }: AudioPlayerProps) {
  const colors = useColors();
  const { t } = useLanguage();
  const audio  = useAudio();

  const p = {
    card:              palette?.card ?? colors.card,
    border:            palette?.border ?? colors.border,
    foreground:        palette?.foreground ?? colors.foreground,
    mutedForeground:   palette?.mutedForeground ?? colors.mutedForeground,
    primary:           palette?.primary ?? colors.primary,
    primaryForeground: palette?.primaryForeground ?? colors.primaryForeground,
    accent:            palette?.accent ?? colors.accent,
  };

  const isActive = audio.queueKey === queueKey;
  const status   = isActive ? audio.status : 'idle';
  const position = isActive ? audio.position : 0;
  const duration = isActive ? audio.duration : 0;
  const hasNext  = isActive && audio.hasNext;
  const hasPrev  = isActive && audio.hasPrevious;
  const progressRatio = duration > 0 ? position / duration : 0;

  const handlePlayPause = () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    if (!isActive) {
      if (!items.length) return;
      audio.playQueue(items, startIndex, queueKey);
    } else {
      audio.togglePlayPause();
    }
  };

  return (
    <View style={[styles.wrap, { backgroundColor: p.card, borderColor: p.border }]}>
      <View style={styles.row}>
        {!compact && (
          <TouchableOpacity
            onPress={() => isActive && audio.previous()}
            accessibilityRole="button"
            accessibilityLabel={t('a11y_prev_verse')}
            disabled={!hasPrev}
            style={[styles.sideBtn, !hasPrev && styles.disabled]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="skip-back" size={15} color={p.foreground} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={handlePlayPause}
          accessibilityRole="button"
          accessibilityLabel={t('a11y_play_pause')}
          style={[styles.playBtn, compact && styles.playBtnCompact, { backgroundColor: p.primary }]}
          activeOpacity={0.85}
        >
          {isActive && status === 'loading' ? (
            <ActivityIndicator color={p.primaryForeground} size="small" />
          ) : (
            <Feather
              name={isActive && status === 'playing' ? 'pause' : 'play'}
              size={compact ? 13 : 16}
              color={p.primaryForeground}
              style={!(isActive && status === 'playing') ? { marginLeft: 2 } : undefined}
            />
          )}
        </TouchableOpacity>

        {!compact && (
          <TouchableOpacity
            onPress={() => isActive && audio.next()}
            accessibilityRole="button"
            accessibilityLabel={t('a11y_next_verse')}
            disabled={!hasNext}
            style={[styles.sideBtn, !hasNext && styles.disabled]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="skip-forward" size={15} color={p.foreground} />
          </TouchableOpacity>
        )}

        <View style={styles.progressCol}>
          {!!title && !compact && (
            <Text style={[styles.title, { color: p.foreground }]} numberOfLines={1}>{title}</Text>
          )}
          <GestureSlider
            value={progressRatio}
            onDragEnd={(ratio) => { if (isActive) audio.seekToRatio(ratio); }}
            trackColor={p.border}
            fillColor={p.accent}
            thumbColor={p.accent}
            height={3}
            thumbSize={compact ? 9 : 10}
            disabled={!isActive || audio.usingFallback}
          />
        </View>
      </View>

      {!compact && (
        <View style={styles.speedRow}>
          {/* Preset speed chips (podcast-style) — predictable values instead
              of a free slider that lands on odd rates like 0.88x. 0.7 is the
              language learner's slow-listening speed. */}
          {RATE_PRESETS.map((r) => {
            const active = Math.abs(audio.rate - r) < 0.01;
            return (
              <TouchableOpacity
                key={r}
                onPress={() => { if (Platform.OS !== 'web') Haptics.selectionAsync(); audio.setRate(r); }}
                accessibilityRole="button"
                accessibilityLabel={`${r}x`}
                accessibilityState={{ selected: active }}
                style={[styles.speedChip, {
                  borderColor: active ? p.primary : p.border,
                  backgroundColor: active ? p.primary : 'transparent',
                }]}
                hitSlop={{ top: 6, bottom: 6 }}
              >
                <Text style={[styles.speedChipText, { color: active ? p.primaryForeground : p.mutedForeground }]}>
                  {r === 1 ? '1.0' : String(r)}
                </Text>
              </TouchableOpacity>
            );
          })}
          <View style={{ flex: 1 }} />

          {/* Repeat toggle: off → verse → chapter. Active modes tint primary;
              verse mode shows a "1" to distinguish single-verse looping. */}
          <TouchableOpacity
            onPress={() => { if (Platform.OS !== 'web') Haptics.selectionAsync(); audio.cycleRepeat(); }}
            accessibilityRole="button"
            accessibilityLabel={t(
              audio.repeatMode === 'verse' ? 'a11y_repeat_verse'
              : audio.repeatMode === 'chapter' ? 'a11y_repeat_chapter'
              : 'a11y_repeat_off',
            )}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.repeatBtn}
          >
            <Feather
              name="repeat"
              size={13}
              color={audio.repeatMode === 'off' ? p.mutedForeground : p.primary}
              style={{ opacity: audio.repeatMode === 'off' ? 0.5 : 1 }}
            />
            {audio.repeatMode === 'verse' && (
              <Text style={[styles.repeatBadge, { color: p.primary }]}>1</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sideBtn: {
    width: 24, height: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  disabled: { opacity: 0.28 },
  playBtn: {
    width: 34, height: 34, borderRadius: 17,
    alignItems: 'center', justifyContent: 'center',
  },
  playBtnCompact: {
    width: 28, height: 28, borderRadius: 14,
  },
  progressCol: { flex: 1, gap: 4 },
  title: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  speedChip: {
    borderWidth: 1,
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 5,
  },
  speedChipText: { fontSize: 10.5, fontFamily: 'Inter_600SemiBold' },
  speedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  repeatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  repeatBadge: {
    fontSize: 8,
    fontFamily: 'Inter_700Bold',
    marginLeft: 1,
  },
});
