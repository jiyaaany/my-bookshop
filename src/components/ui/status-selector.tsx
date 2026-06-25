import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radii } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { READING_STATUS_LABEL, READING_STATUS_ORDER, type ReadingStatus } from '@/types/models';

interface StatusSelectorProps {
  value: ReadingStatus;
  onChange: (status: ReadingStatus) => void;
  /** true = unselected segments get a muted fill (책 추가 폼); false = transparent (책 상세). */
  filled?: boolean;
}

/** Three-segment reading-status picker (읽고 싶다 / 읽는 중 / 완독). */
export function StatusSelector({ value, onChange, filled = false }: StatusSelectorProps) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      {READING_STATUS_ORDER.map((status) => {
        const selected = status === value;
        return (
          <Pressable
            key={status}
            onPress={() => onChange(status)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={({ pressed }) => [
              styles.segment,
              {
                backgroundColor: selected
                  ? theme.primary
                  : filled
                    ? theme.surfaceMuted
                    : 'transparent',
              },
              pressed && styles.pressed,
            ]}>
            <Text
              style={[
                styles.label,
                {
                  color: selected ? theme.onPrimary : theme.textSecondary,
                  fontWeight: selected ? '600' : '500',
                },
              ]}>
              {READING_STATUS_LABEL[status]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: Radii.md,
  },
  label: { fontSize: 13 },
  pressed: { opacity: 0.85 },
});
