import { StyleSheet, Text } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import type { Rating } from '@/types/models';

interface StarRatingProps {
  rating: Rating;
  size?: number;
}

/** Gold ★/☆ rating, matching the cover/detail mocks. */
export function StarRating({ rating, size = 12 }: StarRatingProps) {
  const theme = useTheme();
  const filled = Math.max(0, Math.min(5, rating));
  const stars = '★★★★★'.slice(0, filled) + '☆☆☆☆☆'.slice(0, 5 - filled);
  return (
    <Text style={[styles.stars, { color: theme.star, fontSize: size }]} accessibilityLabel={`별점 ${filled}점`}>
      {stars}
    </Text>
  );
}

const styles = StyleSheet.create({
  stars: {
    letterSpacing: 1,
  },
});
