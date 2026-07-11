import React from 'react';
import { ActivityIndicator, Platform, StyleProp, TouchableOpacity, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useAudio } from '@/context/AudioContext';

interface AudioPlayButtonProps {
  text: string;
  id: string;
  size?: number;
  color?: string;
  activeColor?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Small, subtle listen button — used for single-word pronunciation (vocabulary
 * flashcards, word modal) where a full AudioPlayer would be too heavy.
 * Routes through the shared audio engine, so it stops any other playback.
 */
export function AudioPlayButton({ text, id, size = 16, color, activeColor, style }: AudioPlayButtonProps) {
  const colors = useColors();
  const { currentItem, isPlaying, isLoading, playSingle, togglePlayPause } = useAudio();

  const isThis = currentItem?.id === id;
  const active = isThis && isPlaying;
  const loading = isThis && isLoading;

  const handlePress = () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    if (isThis) togglePlayPause();
    else playSingle(text, id);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      style={style}
      activeOpacity={0.65}
    >
      {loading ? (
        <ActivityIndicator size="small" color={color ?? colors.mutedForeground} />
      ) : (
        <Feather
          name={active ? 'volume-2' : 'volume-1'}
          size={size}
          color={active ? (activeColor ?? colors.primary) : (color ?? colors.mutedForeground)}
          style={{ opacity: active ? 1 : 0.55 }}
        />
      )}
    </TouchableOpacity>
  );
}
