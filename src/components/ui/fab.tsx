import { Pressable, StyleSheet } from 'react-native';

import { PlusIcon } from '@/components/icons';
import { Radii } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface FabProps {
  onPress?: () => void;
  /** Distance from the bottom (above the tab bar). */
  bottom?: number;
  accessibilityLabel?: string;
}

/** Floating action button (책 추가). */
export function Fab({ onPress, bottom = 96, accessibilityLabel = '책 추가' }: FabProps) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.fab,
        { backgroundColor: theme.primary, bottom },
        pressed && styles.pressed,
      ]}>
      <PlusIcon size={26} color={theme.onPrimary} strokeWidth={2.4} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 22,
    width: 58,
    height: 58,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#A6603D',
    shadowOpacity: 0.42,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  pressed: { opacity: 0.9, transform: [{ scale: 0.96 }] },
});
