import React, { useCallback, useEffect, useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface GestureSliderProps {
  /** Current value, 0..1, controlled from outside while not dragging. */
  value: number;
  /** Called continuously while the thumb is being dragged. */
  onDrag?: (ratio: number) => void;
  /** Called once when the drag gesture ends (finger lifted). */
  onDragEnd?: (ratio: number) => void;
  trackColor: string;
  fillColor: string;
  thumbColor: string;
  height?: number;
  thumbSize?: number;
  /** Emit a light haptic tick every `hapticStep` (e.g. 0.05 = every 5%). */
  hapticStep?: number;
  disabled?: boolean;
}

/**
 * Custom Apple-like gesture-driven slider built on react-native-gesture-handler
 * + Reanimated. Used for both the playback progress bar and the speed slider
 * in AudioPlayer — smooth dragging, immediate callbacks, subtle haptics.
 */
export function GestureSlider({
  value, onDrag, onDragEnd,
  trackColor, fillColor, thumbColor,
  height = 4, thumbSize = 16,
  hapticStep, disabled = false,
}: GestureSliderProps) {
  const widthSV        = useSharedValue(0);
  const progress        = useSharedValue(value);
  const draggingRef       = useRef(false);
  const lastHapticBucket   = useRef(-1);

  useEffect(() => {
    if (!draggingRef.current) {
      progress.value = withTiming(Math.max(0, Math.min(1, value)), { duration: 150 });
    }
  }, [value, progress]);

  const updateFromX = useCallback((x: number): number => {
    const w = widthSV.value;
    if (w <= 0) return 0;
    const ratio = Math.max(0, Math.min(1, x / w));
    progress.value = ratio;
    if (hapticStep && Platform.OS !== 'web') {
      const bucket = Math.round(ratio / hapticStep);
      if (bucket !== lastHapticBucket.current) {
        lastHapticBucket.current = bucket;
        Haptics.selectionAsync();
      }
    }
    return ratio;
  }, [hapticStep, progress, widthSV]);

  const pan = Gesture.Pan()
    .enabled(!disabled)
    .onBegin((e) => {
      draggingRef.current = true;
      const ratio = updateFromX(e.x);
      onDrag?.(ratio);
    })
    .onUpdate((e) => {
      const ratio = updateFromX(e.x);
      onDrag?.(ratio);
    })
    .onEnd((e) => {
      const ratio = updateFromX(e.x);
      draggingRef.current = false;
      onDragEnd?.(ratio);
    })
    .runOnJS(true);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * widthSV.value - thumbSize / 2 }],
  }));
  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <GestureDetector gesture={pan}>
      <View
        style={[styles.hitArea, { height: Math.max(height, thumbSize) + 16 }, disabled && styles.disabled]}
        onLayout={(e) => { widthSV.value = e.nativeEvent.layout.width; }}
      >
        <View style={[styles.trackLine, { height, backgroundColor: trackColor, borderRadius: height / 2 }]}>
          <Animated.View style={[styles.fill, { backgroundColor: fillColor, borderRadius: height / 2 }, fillStyle]} />
        </View>
        <Animated.View
          style={[
            styles.thumb,
            { width: thumbSize, height: thumbSize, borderRadius: thumbSize / 2, backgroundColor: thumbColor },
            thumbStyle,
          ]}
        />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  hitArea: {
    justifyContent: 'center',
    width: '100%',
  },
  disabled: { opacity: 0.45 },
  trackLine: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
  thumb: {
    position: 'absolute',
    left: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});
