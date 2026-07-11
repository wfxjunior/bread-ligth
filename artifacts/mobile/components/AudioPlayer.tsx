import React from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useAudio, type AudioQueueItem, MIN_RATE, MAX_RATE } from '@/context/AudioContext';
import { GestureSlider } from './GestureSlider';

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
            disabled={!hasPrev}
            style={[styles.sideBtn, !hasPrev && styles.disabled]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="skip-back" size={15} color={p.foreground} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={handlePlayPause}
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
          <Feather name="fast-forward" size={10} color={p.mutedForeground} />
          <View style={styles.speedSlider}>
            <GestureSlider
              value={(audio.rate - MIN_RATE) / (MAX_RATE - MIN_RATE)}
              onDrag={(ratio) => audio.setRate(MIN_RATE + ratio * (MAX_RATE - MIN_RATE))}
              onDragEnd={(ratio) => audio.setRate(MIN_RATE + ratio * (MAX_RATE - MIN_RATE))}
              trackColor={p.border}
              fillColor={p.primary}
              thumbColor={p.primary}
              height={3}
              thumbSize={12}
              hapticStep={0.04}
            />
          </View>
          <Text style={[styles.speedLabel, { color: p.mutedForeground }]}>{audio.rate.toFixed(2)}x</Text>
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
  speedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  speedSlider: { flex: 1 },
  speedLabel: { fontSize: 10, fontFamily: 'Inter_600SemiBold', width: 34, textAlign: 'right' },
});
