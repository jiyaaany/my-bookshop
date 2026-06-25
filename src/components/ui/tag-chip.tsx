import { Pressable, StyleSheet, Text } from 'react-native';

import { Radii } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface TagChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

/** Filter/tag pill used by the library status tabs and tag filters. */
export function TagChip({ label, selected = false, onPress }: TagChipProps) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        { backgroundColor: selected ? theme.primary : theme.surfaceMuted },
        pressed && styles.pressed,
      ]}>
      <Text
        style={[
          styles.label,
          { color: selected ? theme.onPrimary : theme.textSecondary, fontWeight: selected ? '600' : '500' },
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: Radii.full,
  },
  label: {
    fontSize: 13,
  },
  pressed: { opacity: 0.85 },
});
