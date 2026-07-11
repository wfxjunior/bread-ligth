import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * Renders the active Reading Space's background gradient and smoothly
 * crossfades to a new gradient whenever the space changes — used on Home,
 * the chapter reader, and the daily devotional so switching atmospheres
 * never produces a hard flash.
 */
export default function SpaceBackground({
  gradient,
  style,
  duration = 420,
}: {
  gradient: readonly [string, string, string];
  style?: ViewStyle;
  duration?: number;
}) {
  const [base, setBase] = useState(gradient);
  const [incoming, setIncoming] = useState<readonly [string, string, string] | null>(null);
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (gradient[0] === base[0] && gradient[1] === base[1] && gradient[2] === base[2]) return;
    setIncoming(gradient);
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration, useNativeDriver: true }).start(({ finished }) => {
      if (finished) {
        setBase(gradient);
        setIncoming(null);
        fade.setValue(0);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gradient[0], gradient[1], gradient[2]]);

  return (
    <>
      <LinearGradient colors={[...base]} style={[StyleSheet.absoluteFill, style]} />
      {incoming && (
        <Animated.View style={[StyleSheet.absoluteFill, style, { opacity: fade }]}>
          <LinearGradient colors={[...incoming]} style={StyleSheet.absoluteFill} />
        </Animated.View>
      )}
    </>
  );
}
