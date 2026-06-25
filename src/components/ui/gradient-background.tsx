import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { StyleSheet, View } from 'react-native';

interface GradientBackgroundProps {
  colors: [string, string];
}

/**
 * Absolute-fill diagonal gradient (≈150°), used as a book-cover placeholder.
 * Uses react-native-svg (no extra native dep) so it works on all platforms.
 */
export function GradientBackground({ colors }: GradientBackgroundProps) {
  return (
    <View style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id="cover" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors[0]} />
            <Stop offset="1" stopColor={colors[1]} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#cover)" />
      </Svg>
    </View>
  );
}
