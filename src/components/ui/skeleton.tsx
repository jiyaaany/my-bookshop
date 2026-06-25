import { useEffect, useRef } from 'react';
import { Animated, type ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

interface SkeletonProps {
  width?: ViewStyle['width'];
  height?: ViewStyle['height'];
  radius?: number;
  style?: ViewStyle;
}

/** Pulsing placeholder block for loading states (dependency-free shimmer). */
export function Skeleton({ width = '100%', height = 12, radius = 4, style }: SkeletonProps) {
  const theme = useTheme();
  const pulse = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.5, duration: 650, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: radius, backgroundColor: theme.skeletonBase, opacity: pulse },
        style,
      ]}
    />
  );
}
