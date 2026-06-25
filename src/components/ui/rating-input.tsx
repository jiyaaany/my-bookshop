import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import type { Rating } from '@/types/models';

interface RatingInputProps {
  value: Rating | undefined;
  onChange: (rating: Rating) => void;
  size?: number;
}

/** Tappable 1–5 star rating (tap the current value to clear back to 0). */
export function RatingInput({ value, onChange, size = 28 }: RatingInputProps) {
  const theme = useTheme();
  const current = value ?? 0;
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= current;
        return (
          <Pressable
            key={n}
            hitSlop={4}
            accessibilityRole="button"
            accessibilityLabel={`별점 ${n}점`}
            onPress={() => onChange((n === current ? 0 : n) as Rating)}>
            <Text style={[styles.star, { fontSize: size, color: filled ? theme.star : theme.border }]}>
              {filled ? '★' : '☆'}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6 },
  star: { letterSpacing: 1 },
});
