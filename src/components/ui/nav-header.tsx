import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChevronLeftIcon, CloseIcon } from '@/components/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface NavHeaderProps {
  title?: string;
  titlePlacement?: 'left' | 'center';
  leftIcon?: 'chevron' | 'close';
  onLeft?: () => void;
  right?: ReactNode;
}

/** Top navigation row used by detail / add / editor screens. */
export function NavHeader({
  title,
  titlePlacement = 'left',
  leftIcon = 'chevron',
  onLeft,
  right,
}: NavHeaderProps) {
  const theme = useTheme();
  const Icon = leftIcon === 'close' ? CloseIcon : ChevronLeftIcon;
  return (
    <View style={styles.row}>
      <Pressable
        onPress={onLeft}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={leftIcon === 'close' ? '닫기' : '뒤로'}
        style={({ pressed }) => pressed && styles.pressed}>
        <Icon size={24} color={theme.heading} />
      </Pressable>

      {title && titlePlacement === 'left' ? (
        <Text style={[styles.titleLeft, { color: theme.heading }]} numberOfLines={1}>
          {title}
        </Text>
      ) : null}

      <View style={styles.spacer} />
      {right}

      {title && titlePlacement === 'center' ? (
        <Text style={[styles.titleCenter, { color: theme.heading }]} pointerEvents="none" numberOfLines={1}>
          {title}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
    gap: 12,
  },
  spacer: { flex: 1 },
  titleLeft: { fontSize: 17, fontWeight: '700' },
  titleCenter: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: Spacing.two,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
  },
  pressed: { opacity: 0.6 },
});
