import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import type { Tier } from '@/constants/achievements';

// Tier metals — engraved-medal palette (no neon, no cartoons).
const TIER_METAL: Record<Tier, { ring: string; fill: string; icon: string }> = {
  bronze:   { ring: '#A9713D', fill: '#A9713D22', icon: '#8A5A2E' },
  silver:   { ring: '#9AA1A9', fill: '#9AA1A922', icon: '#6E767E' },
  gold:     { ring: '#B8921A', fill: '#B8921A22', icon: '#96760F' },
  platinum: { ring: '#7C8FA3', fill: '#7C8FA322', icon: '#5A6B7D' },
  legacy:   { ring: '#6B1E2A', fill: '#6B1E2A22', icon: '#6B1E2A' },
};

/**
 * MedalArtwork — renders final medal art when it ships, and a handcrafted
 * code-drawn medal (tier-metal ring + engraved icon) until then. Future
 * artwork convention (drop-in, no code change beyond the require map):
 *   assets/medals/<collection>/<slug>[-<tier>].webp
 *   e.g. assets/medals/reading/consistent-reader-gold.webp
 * Register files in ART below; anything unregistered falls back gracefully.
 */
const ART: Record<string, number> = {
  // 'consistent_reader:gold': require('@/assets/medals/reading/consistent-reader-gold.webp'),
};

export function MedalArtwork({
  icon, tier, earned, size = 52,
}: { icon: string; tier?: Tier | null; earned: boolean; size?: number }) {
  const colors = useColors();
  const metal = tier ? TIER_METAL[tier] : { ring: colors.accent, fill: colors.accent + '1A', icon: colors.accent };
  const ring = earned ? metal.ring : colors.border;
  const fill = earned ? metal.fill : colors.muted;
  const iconColor = earned ? metal.icon : colors.mutedForeground;

  return (
    <View
      style={[styles.medal, { width: size, height: size, borderRadius: size / 2, borderColor: ring, backgroundColor: fill, opacity: earned ? 1 : 0.55 }]}
    >
      {/* inner engraved ring */}
      <View style={[styles.inner, { width: size - 10, height: size - 10, borderRadius: (size - 10) / 2, borderColor: ring + '55' }]}>
        <Feather name={icon as any} size={size * 0.42} color={iconColor} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  medal: { borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  inner: { borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
